// Directus session storage: access + refresh tokens live in httpOnly cookies
// on the site's own domain, never in the browser's reach (ADR 0002). The
// access cookie's max-age mirrors the token's own lifetime, so "cookie
// present" means "token still valid" and no JWT decoding is needed.
import { refresh } from "@directus/sdk"
import type { AuthenticationData } from "@directus/sdk"
import type { H3Event } from "h3"

export const ACCESS_TOKEN_COOKIE = "jn_access_token"
export const REFRESH_TOKEN_COOKIE = "jn_refresh_token"

// Matches REFRESH_TOKEN_TTL=30d on the instance. Re-set on every refresh, so
// the session slides with activity.
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

// Expire the access cookie slightly before the token itself, so a request
// that still carries it cannot race the expiry.
const EXPIRY_SAFETY_MARGIN_MS = 10_000

declare module "h3" {
  interface H3EventContext {
    // Access token resolved for this request: a string when the visitor has a
    // live session, null when not, undefined before resolution.
    directusAccessToken?: string | null
  }
}

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  // Dev runs on plain http://localhost, where a secure cookie is dropped.
  secure: !import.meta.dev,
  sameSite: "lax",
  path: "/",
} as const

export function setDirectusSession(event: H3Event, data: AuthenticationData): void {
  const { access_token: accessToken, refresh_token: refreshToken, expires } = data
  if (accessToken === null || refreshToken === null || expires === null) {
    throw new Error("Directus returned an incomplete session")
  }

  const accessMaxAge = Math.max(1, Math.floor((expires - EXPIRY_SAFETY_MARGIN_MS) / 1000))
  setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: accessMaxAge,
  })
  setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  })

  // The cookies just set are on the response; this request must read the new
  // token from the context instead.
  event.context.directusAccessToken = accessToken
}

export function clearDirectusSession(event: H3Event): void {
  deleteCookie(event, ACCESS_TOKEN_COOKIE, SESSION_COOKIE_OPTIONS)
  deleteCookie(event, REFRESH_TOKEN_COOKIE, SESSION_COOKIE_OPTIONS)
  event.context.directusAccessToken = null
}

export function getDirectusRefreshToken(event: H3Event): string | undefined {
  const token = getCookie(event, REFRESH_TOKEN_COOKIE)
  return token === "" ? undefined : token
}

// Concurrent requests arriving after the access token expired would each
// spend the same refresh token, and Directus rotates it — the loser would be
// logged out. Share one in-flight refresh per token within the process.
const inFlightRefreshes = new Map<string, Promise<AuthenticationData>>()

async function refreshDirectusSession(
  url: string,
  refreshToken: string,
): Promise<AuthenticationData> {
  const pending = inFlightRefreshes.get(refreshToken)
  if (pending !== undefined) {
    return pending
  }

  const request = createDirectusClient(url)
    .request(refresh({ mode: "json", refresh_token: refreshToken }))
    .finally(() => {
      inFlightRefreshes.delete(refreshToken)
    })
  inFlightRefreshes.set(refreshToken, request)
  return request
}

async function loadAccessToken(event: H3Event): Promise<string | null> {
  const accessToken = getCookie(event, ACCESS_TOKEN_COOKIE)
  if (accessToken !== undefined && accessToken !== "") {
    return accessToken
  }

  const refreshToken = getDirectusRefreshToken(event)
  if (refreshToken === undefined) {
    return null
  }

  try {
    const data = await refreshDirectusSession(
      useRuntimeConfig(event).public.directusUrl,
      refreshToken,
    )
    setDirectusSession(event, data)
    return data.access_token
  } catch {
    // Refresh token spent, revoked or expired — the session is over.
    clearDirectusSession(event)
    return null
  }
}

// Access token for this request, refreshing transparently when the previous
// one expired. Resolved once per request.
export async function resolveDirectusAccessToken(event: H3Event): Promise<string | null> {
  if (event.context.directusAccessToken !== undefined) {
    return event.context.directusAccessToken
  }

  const token = await loadAccessToken(event)
  event.context.directusAccessToken ??= token
  return token
}
