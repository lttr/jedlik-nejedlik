// Credentials in, a sealed cookie out, and the transparent refresh that keeps
// it alive. No Directus token ever reaches the browser (ADR 0002).
import { login, logout, refresh } from "@directus/sdk"
import type { AuthenticationData } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { Credentials, Account, AccountSecrets } from "../../shared/types/account"

// Refresh before the access token actually dies, so a request that starts
// valid cannot finish expired.
const REFRESH_SKEW_MS = 30_000

const CredentialsSchema = z.object({
  email: AccountEmail,
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

function toAccountSecrets(data: AuthenticationData): AccountSecrets {
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
export async function authenticateAccount(
  event: H3Event,
  credentials: Credentials,
  unavailable: string = authMessages.unavailable,
): Promise<AccountSecrets | null> {
  try {
    const data = await getDirectusAnonymousServerClient(event).request(
      login({ email: credentials.email, password: credentials.password }, { mode: "json" }),
    )
    return toAccountSecrets(data)
  } catch (error) {
    // Wrong password, unknown e-mail, Unverified account and suspended user
    // are all the same answer; Directus does not tell them apart (probe).
    if (isCredentialRejection(error)) {
      return null
    }
    throw unexpectedAuthError("Directus rejected a login request", error, unavailable)
  }
}

export async function logInAccount(event: H3Event, credentials: Credentials): Promise<void> {
  const secrets = await authenticateAccount(event, credentials)
  if (secrets === null) {
    throw authError(401, "invalid_credentials", authMessages.invalidCredentials)
  }
  await writeAccountSession(event, { email: credentials.email }, secrets)
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

export async function logOutAccount(event: H3Event): Promise<void> {
  const { secrets } = await readAccountSession(event)
  // Not on the Account's critical path: the local session goes either way.
  const revoked =
    secrets === undefined ? Promise.resolve() : revokeRefreshToken(event, secrets.refreshToken)

  await Promise.all([revoked, dropAccountSession(event)])
}

// Directus rotates the refresh token on every use, so two requests carrying
// the same one would race and the loser's 401 would clear a live session.
// One in-flight refresh per token; each request writes the result onto its
// own response.
const refreshesInFlight = new Map<string, Promise<AccountSecrets | null>>()

async function requestFreshSecrets(
  event: H3Event,
  refreshToken: string,
): Promise<AccountSecrets | null> {
  try {
    const data = await getDirectusAnonymousServerClient(event).request(
      refresh({ mode: "json", refresh_token: refreshToken }),
    )
    return toAccountSecrets(data)
  } catch (error) {
    // Expired, revoked or already rotated: the Account really is logged out.
    if (isCredentialRejection(error)) {
      return null
    }
    // Directus is unreachable: leave the session alone, an outage must never
    // silently downgrade an Account to a guest.
    throw unexpectedAuthError("Directus refresh failed", error)
  }
}

async function freshSecrets(event: H3Event, refreshToken: string): Promise<AccountSecrets | null> {
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
  account: Account,
  secrets: AccountSecrets,
): Promise<string | null> {
  const fresh = await freshSecrets(event, secrets.refreshToken)
  if (fresh === null) {
    await dropAccountSession(event)
    return null
  }
  await writeAccountSession(event, account, fresh)
  return fresh.accessToken
}

// Refreshes transparently, which re-seals the cookie and slides the 30-day
// window.
export async function resolveAccountAccessToken(event: H3Event): Promise<string | null> {
  const { account, secrets } = await readAccountSession(event)
  if (account === undefined || secrets === undefined) {
    return null
  }
  if (Date.now() < secrets.accessTokenExpiresAt - REFRESH_SKEW_MS) {
    return secrets.accessToken
  }
  return refreshSession(event, account, secrets)
}

// Bound to the Account's own session, so gated reads and writes inherit
// Directus permission enforcement (R-5): a Student sees their own rows, an
// Author their drafts. Null when nobody is logged in.
export async function getAccountDirectusClient(event: H3Event): Promise<DirectusRestClient | null> {
  const token = await resolveAccountAccessToken(event)
  if (token === null) {
    return null
  }
  return createDirectusTokenClient(useRuntimeConfig(event).public.directusUrl, token)
}

// One 401 for every gated route, so the next one (a course, an order) does
// not invent its own.
export async function requireAccountDirectusClient(
  event: H3Event,
): Promise<{ account: Account; client: DirectusRestClient }> {
  const { account } = await readAccountSession(event)
  const client = await getAccountDirectusClient(event)
  if (account === undefined || client === null) {
    throw authError(401, "not_logged_in", authMessages.notLoggedIn)
  }
  return { account, client }
}
