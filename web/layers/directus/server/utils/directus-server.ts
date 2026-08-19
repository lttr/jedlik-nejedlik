// Per-request Directus clients for SSR and Nitro code. Any layer's server
// code uses these so Directus itself enforces the Student's permissions
// (R-5) — no permission logic is duplicated in the app.
import type { H3Event } from "h3"

// Anonymous client for public content and for the auth endpoints themselves
// (login, password reset), which carry no identity.
export function getDirectusAnonymousServerClient(event: H3Event): DirectusRestClient {
  return createDirectusClient(useRuntimeConfig(event).public.directusUrl)
}

// Client bound to the visitor's session, or null when there is no live
// session. Refreshes the access token transparently when it has expired.
export async function getDirectusServerClient(event: H3Event): Promise<DirectusRestClient | null> {
  const token = await resolveDirectusAccessToken(event)
  if (token === null) {
    return null
  }
  return createDirectusTokenClient(useRuntimeConfig(event).public.directusUrl, token)
}
