import type { AuthenticationData } from "@directus/sdk"
import { refresh } from "@directus/sdk"
import type { H3Event } from "h3"
import type { SecureSessionData } from "#auth-utils"
// Imported explicitly rather than relying on the layer auto-import: the unit
// tests load this module directly, outside Nuxt, where auto-imports do not
// exist. Nitro resolves the relative path just the same.
import { readUnknownProp } from "../../shared/utils/auth"

// Server-side identity plumbing: turning Directus auth responses into session
// tokens, keeping the access token fresh, and translating Directus failures
// into the Czech messages the forms render (spec decision 6).

// Refresh this long before the access token actually expires, so a token handed
// out at the start of a request is still valid when Directus sees it.
export const TOKEN_REFRESH_SKEW_MS = 60_000

/**
 * Whether an access token expiring at `expiresAt` should be refreshed now.
 * Pure so the decision is testable without a clock or a network.
 */
export function isTokenStale(expiresAt: number, now: number): boolean {
  return expiresAt - TOKEN_REFRESH_SKEW_MS <= now
}

/**
 * Normalise a Directus auth response into the session's secure half.
 *
 * Every field is nullable on the wire even though `mode: "json"` always fills
 * them, so an incomplete response yields `null` rather than a session holding
 * `null` tokens. Prefers the absolute `expires_at`, falling back to the `expires`
 * TTL measured from `now`.
 */
export function sessionTokensFrom(auth: AuthenticationData, now: number): SecureSessionData | null {
  const { access_token: accessToken, refresh_token: refreshToken } = auth
  if (accessToken === null || refreshToken === null) {
    return null
  }

  const expiresAt = auth.expires_at ?? (auth.expires === null ? null : now + auth.expires)
  if (expiresAt === null) {
    return null
  }

  return { accessToken, refreshToken, expiresAt }
}

/**
 * Absolute URL for one of our own pages, for links Directus mails out.
 *
 * Built from the configured site URL rather than the request's Host header:
 * the header is attacker-controllable, and this string ends up in an e-mail
 * sent to the address someone else typed. Directus also matches it against
 * `USER_REGISTER_URL_ALLOW_LIST` / `PASSWORD_RESET_URL_ALLOW_LIST`, so it has
 * to be the canonical domain regardless.
 */
export function siteUrlFor(event: H3Event, path: string): string {
  const { url } = getSiteConfig(event)
  if (url === undefined) {
    throw createError({ statusCode: 500, statusMessage: "Site URL is not configured" })
  }
  return new URL(path, url).href
}

/**
 * The Directus error code behind a thrown SDK request, when there is one.
 * Directus answers `{ errors: [{ extensions: { code } }] }`; anything else
 * (a network failure, a proxy error page) yields `undefined`.
 */
export function directusErrorCode(error: unknown): string | undefined {
  const errors = readUnknownProp(error, "errors")
  if (!Array.isArray(errors)) {
    return undefined
  }

  const code = readUnknownProp(readUnknownProp(errors[0], "extensions"), "code")
  return typeof code === "string" ? code : undefined
}

/**
 * Read the session's access token, refreshing it through Directus first if it
 * is at or near expiry. The returned token is valid for the rest of the
 * request. A session that cannot be refreshed is cleared and rejected — the
 * Student signs in again rather than seeing half-authenticated pages.
 */
export async function getStudentToken(event: H3Event): Promise<string> {
  const session = await requireUserSession(event)

  // Every failure below lands here: drop the cookie, then 401. A session we
  // cannot refresh is worse than no session — it renders as signed in while
  // every Directus call behind it fails.
  async function signedOut(): Promise<never> {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }

  const secure = session.secure
  if (secure === undefined) {
    return signedOut()
  }

  if (!isTokenStale(secure.expiresAt, Date.now())) {
    return secure.accessToken
  }

  let refreshed: AuthenticationData
  try {
    refreshed = await getServerDirectusClient().request(
      refresh({ refresh_token: secure.refreshToken, mode: "json" }),
    )
  } catch {
    return signedOut()
  }

  const tokens = sessionTokensFrom(refreshed, Date.now())
  if (tokens === null) {
    return signedOut()
  }

  await setUserSession(event, { user: session.user, secure: tokens })
  return tokens.accessToken
}
