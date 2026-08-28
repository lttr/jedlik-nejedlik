// The whole session core: credentials in, a sealed cookie out, and the
// transparent refresh that keeps it alive. Nothing below this boundary ever
// reaches the browser (ADR 0002).
import { login, logout, refresh } from "@directus/sdk"
import type { AuthenticationData } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { Credentials, Student, StudentSecrets } from "../../shared/types/student"

// Refresh a little before the access token actually dies, so a request that
// starts valid cannot finish expired.
const REFRESH_SKEW_MS = 30_000

// The e-mail is normalised on the way in (see StudentEmail); the session
// caches the lowercased form, which is all we can do — the Student policy has
// no `read` on `directus_users`, so the stored value can never be read back.
const CredentialsSchema = z.object({
  email: StudentEmail,
  password: z.string().min(1),
})

// A malformed login payload answers exactly like a wrong password: telling
// the two apart is the first step of enumerating accounts.
export async function readCredentials(event: H3Event): Promise<Credentials> {
  return readAuthBody(
    event,
    CredentialsSchema,
    authError(401, "invalid_credentials", authMessages.invalidCredentials),
  )
}

function isCredentialRejection(error: unknown): boolean {
  return directusErrorCode(error) === "INVALID_CREDENTIALS"
}

function toStudentSecrets(data: AuthenticationData): StudentSecrets {
  const { access_token: accessToken, refresh_token: refreshToken, expires } = data
  if (accessToken === null || refreshToken === null || expires === null) {
    throw new Error("Directus returned an authentication response without tokens")
  }
  return { accessToken, refreshToken, accessTokenExpiresAt: Date.now() + expires }
}

// The one place the app sends a password to Directus. Null means Directus
// rejected the credentials — what that means is the caller's to say, because
// the same rejection reads as "wrong e-mail or password" at the login form
// and "wrong current password" at the change-password form. A Directus that
// did not answer at all throws instead, so an outage is never reported as a
// bad password.
//
// This request's session is deliberately untouched: verifying a password and
// adopting the identity behind it are two different things.
export async function authenticateStudent(
  event: H3Event,
  credentials: Credentials,
  unavailable: string = authMessages.unavailable,
): Promise<StudentSecrets | null> {
  try {
    const data = await getDirectusAnonymousServerClient(event).request(
      login({ email: credentials.email, password: credentials.password }, { mode: "json" }),
    )
    return toStudentSecrets(data)
  } catch (error) {
    // Wrong password, unknown e-mail, an account still Unverified and a user
    // suspended by Directus's login-attempt limiting are one and the same
    // answer here — Directus itself does not tell them apart (probe).
    if (isCredentialRejection(error)) {
      return null
    }
    throw unexpectedAuthError("Directus rejected a login request", error, unavailable)
  }
}

export async function logInStudent(event: H3Event, credentials: Credentials): Promise<void> {
  const secrets = await authenticateStudent(event, credentials)
  if (secrets === null) {
    throw authError(401, "invalid_credentials", authMessages.invalidCredentials)
  }
  await writeStudentSession(event, { email: credentials.email }, secrets)
}

// Ends one Directus session, identified by its refresh token. Best effort by
// design: every caller has already decided that session must die, and a token
// Directus has forgotten already (expired, rotated, revoked) is not an error
// anyone can act on.
export async function revokeRefreshToken(event: H3Event, refreshToken: string): Promise<void> {
  await getDirectusAnonymousServerClient(event)
    .request(logout({ mode: "json", refresh_token: refreshToken }))
    .catch((error: unknown) => {
      console.warn("[auth] Directus logout failed", error)
    })
}

export async function logOutStudent(event: H3Event): Promise<void> {
  const { secrets } = await readStudentSession(event)
  // Not on the Student's critical path: the local session goes either way.
  const revoked =
    secrets === undefined ? Promise.resolve() : revokeRefreshToken(event, secrets.refreshToken)

  await Promise.all([revoked, dropStudentSession(event)])
}

// Directus rotates the refresh token on every use, so two requests carrying
// the same one would race and the loser's 401 would clear a session that is
// in fact alive. One in-flight refresh per token, shared by every request
// that needs it; each still writes the result onto its own response.
const refreshesInFlight = new Map<string, Promise<StudentSecrets | null>>()

async function requestFreshSecrets(
  event: H3Event,
  refreshToken: string,
): Promise<StudentSecrets | null> {
  try {
    const data = await getDirectusAnonymousServerClient(event).request(
      refresh({ mode: "json", refresh_token: refreshToken }),
    )
    return toStudentSecrets(data)
  } catch (error) {
    // Directus has forgotten this session: expired, revoked, or already
    // rotated. The Student really is logged out.
    if (isCredentialRejection(error)) {
      return null
    }
    // Directus is unreachable. Say so loudly and leave the session alone — a
    // visitor must never be silently downgraded to a guest by an outage.
    throw unexpectedAuthError("Directus refresh failed", error)
  }
}

async function freshSecrets(event: H3Event, refreshToken: string): Promise<StudentSecrets | null> {
  const shared = refreshesInFlight.get(refreshToken)
  if (shared !== undefined) {
    return shared
  }
  const pending = requestFreshSecrets(event, refreshToken)
  refreshesInFlight.set(refreshToken, pending)
  try {
    return await pending
  } finally {
    refreshesInFlight.delete(refreshToken)
  }
}

async function refreshSession(
  event: H3Event,
  student: Student,
  secrets: StudentSecrets,
): Promise<string | null> {
  const fresh = await freshSecrets(event, secrets.refreshToken)
  if (fresh === null) {
    await dropStudentSession(event)
    return null
  }
  await writeStudentSession(event, student, fresh)
  return fresh.accessToken
}

// A valid Directus access token for the Student behind this request, or null
// when there is no live session. Refreshes transparently, which also re-seals
// the cookie and so slides the 30-day window.
export async function resolveStudentAccessToken(event: H3Event): Promise<string | null> {
  const { student, secrets } = await readStudentSession(event)
  if (student === undefined || secrets === undefined) {
    return null
  }
  if (Date.now() < secrets.accessTokenExpiresAt - REFRESH_SKEW_MS) {
    return secrets.accessToken
  }
  return refreshSession(event, student, secrets)
}

// Per-request Directus client bound to the Student's own session, so gated
// reads and writes inherit Directus permission enforcement (R-5). Null when
// the request carries no live session.
export async function getStudentDirectusClient(event: H3Event): Promise<DirectusRestClient | null> {
  const token = await resolveStudentAccessToken(event)
  if (token === null) {
    return null
  }
  return createDirectusTokenClient(useRuntimeConfig(event).public.directusUrl, token)
}

// What every gated Nitro route needs: who is logged in, a Directus client
// speaking for them, and one 401 when there is no live session — so that the
// next such route (a course, an order) does not invent its own.
export async function requireStudentDirectusClient(
  event: H3Event,
): Promise<{ student: Student; client: DirectusRestClient }> {
  const { student } = await readStudentSession(event)
  const client = await getStudentDirectusClient(event)
  if (student === undefined || client === null) {
    throw authError(401, "not_logged_in", authMessages.notLoggedIn)
  }
  return { student, client }
}
