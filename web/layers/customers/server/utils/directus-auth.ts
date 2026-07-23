import { createDirectus, refresh, rest, staticToken } from "@directus/sdk"
import type { AuthenticationData, DirectusClient, RestClient } from "@directus/sdk"
import type { H3Event } from "h3"

import type { Schema } from "../../../directus/shared/types/directus"
import type { SessionUser } from "../../shared/utils/auth"

// Session lives in two httpOnly cookies on OUR origin (never Directus's own
// cookie — it sits on a different domain the browser won't send here). The
// access token is used on the fast path; the refresh token mints a new pair
// only when the access token is gone/expired. Directus rotates refresh tokens,
// so refreshing on every request would race concurrent SSR + hydration loads —
// caching the access token keeps rotation to at most once per access lifetime.
export const COOKIE_ACCESS = "d_access"
export const COOKIE_REFRESH = "d_refresh"

// Directus default REFRESH_TOKEN_TTL is 7 days; cap the refresh cookie to match.
const REFRESH_MAX_AGE_S = 60 * 60 * 24 * 7

export type AuthedClient = DirectusClient<Schema> & RestClient<Schema>

function directusUrl(event: H3Event): string {
  return useRuntimeConfig(event).public.directusUrl
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    // Dropped over plain HTTP would break local dev; every deployed env is HTTPS.
    secure: !import.meta.dev,
    sameSite: "lax" as const,
    path: "/",
  }
}

/** A bare (unauthenticated) REST client — used for the auth endpoints. */
export function getDirectusRest(event: H3Event): AuthedClient {
  return createDirectus<Schema>(directusUrl(event)).with(rest())
}

/** A REST client carrying a specific access token. */
export function clientWithToken(event: H3Event, token: string): AuthedClient {
  return createDirectus<Schema>(directusUrl(event)).with(staticToken(token)).with(rest())
}

export function setAuthCookies(event: H3Event, auth: AuthenticationData): void {
  const base = baseCookieOptions()
  if (auth.access_token !== null && auth.access_token !== "") {
    // `expires` is milliseconds until the access token lapses.
    const maxAge =
      auth.expires !== null && auth.expires > 0 ? Math.floor(auth.expires / 1000) : undefined
    setCookie(event, COOKIE_ACCESS, auth.access_token, { ...base, maxAge })
  }
  if (auth.refresh_token !== null && auth.refresh_token !== "") {
    setCookie(event, COOKIE_REFRESH, auth.refresh_token, { ...base, maxAge: REFRESH_MAX_AGE_S })
  }
}

export function clearAuthCookies(event: H3Event): void {
  const base = baseCookieOptions()
  deleteCookie(event, COOKIE_ACCESS, base)
  deleteCookie(event, COOKIE_REFRESH, base)
}

/**
 * The current access token, refreshing (and rotating the cookies) when only the
 * refresh token remains. `null` when the visitor has no usable session.
 */
export async function resolveAccessToken(event: H3Event): Promise<string | null> {
  const access = getCookie(event, COOKIE_ACCESS)
  if (access !== undefined && access !== "") {
    return access
  }

  const refreshToken = getCookie(event, COOKIE_REFRESH)
  if (refreshToken === undefined || refreshToken === "") {
    return null
  }

  try {
    const data = await getDirectusRest(event).request(
      refresh({ refresh_token: refreshToken, mode: "json" }),
    )
    setAuthCookies(event, data)
    return data.access_token
  } catch {
    clearAuthCookies(event)
    return null
  }
}

/** An authenticated client for the current session, or `null` if anonymous. */
export async function getAuthedClient(event: H3Event): Promise<AuthedClient | null> {
  const token = await resolveAccessToken(event)
  return token !== null && token !== "" ? clientWithToken(event, token) : null
}

/** Origin of the incoming request, for building email links to our own pages. */
export function requestOrigin(event: H3Event): string {
  return getRequestURL(event).origin
}

// Directus `readMe` row → the app's SessionUser (null → undefined per the
// project's Directus convention).
export function toSessionUser(me: {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
}): SessionUser {
  return {
    id: me.id,
    email: me.email ?? "",
    first_name: me.first_name ?? undefined,
    last_name: me.last_name ?? undefined,
  }
}
