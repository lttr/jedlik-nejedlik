// Credentials in, a sealed cookie out, and the transparent refresh that keeps
// it alive. No Directus token ever reaches the browser (ADR 0002).
import { login, logout, refresh } from "@directus/sdk"
import type { AuthenticationData } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { Credentials, Student, StudentSecrets } from "../../shared/types/student"

// Refresh before the access token actually dies, so a request that starts
// valid cannot finish expired.
const REFRESH_SKEW_MS = 30_000

// The session caches the lowercased e-mail: the Student policy has no `read`
// on `directus_users`, so the stored value can never be read back.
const CredentialsSchema = z.object({
  email: StudentEmail,
  password: z.string().min(1),
})

// A malformed payload answers exactly like a wrong password: telling the two
// apart is the first step of enumerating accounts.
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

// The one place a password goes to Directus. Null means Directus rejected the
// credentials; the caller says what that means (wrong login, or wrong current
// password). An outage throws instead, so it is never reported as a bad
// password. This request's session is left untouched: verifying a password
// is not adopting the identity behind it.
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
    // Wrong password, unknown e-mail, Unverified account and suspended user
    // are all the same answer; Directus does not tell them apart (probe).
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

// Best effort: every caller has already decided this session must die, and a
// token Directus has forgotten (expired, rotated, revoked) is not actionable.
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
// the same one would race and the loser's 401 would clear a live session.
// One in-flight refresh per token; each request writes the result onto its
// own response.
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
    // Expired, revoked or already rotated: the Student really is logged out.
    if (isCredentialRejection(error)) {
      return null
    }
    // Directus is unreachable: leave the session alone, an outage must never
    // silently downgrade a Student to a guest.
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

// Refreshes transparently, which re-seals the cookie and slides the 30-day
// window.
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

// Bound to the Student's own session, so gated reads and writes inherit
// Directus permission enforcement (R-5).
export async function getStudentDirectusClient(event: H3Event): Promise<DirectusRestClient | null> {
  const token = await resolveStudentAccessToken(event)
  if (token === null) {
    return null
  }
  return createDirectusTokenClient(useRuntimeConfig(event).public.directusUrl, token)
}

// One 401 for every gated route, so the next one (a course, an order) does
// not invent its own.
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
