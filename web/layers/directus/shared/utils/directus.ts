import { createDirectus, rest, staticToken } from "@directus/sdk"
import type { DirectusClient, RestClient } from "@directus/sdk"
import type { Schema } from "../types/directus"

export type DirectusRestClient = DirectusClient<Schema> & RestClient<Schema>

// Pure factory — no Vue/Nitro APIs, usable from both app and server code.
export function createDirectusClient(url: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(rest())
}

// Same client bound to a Directus token, so every request carries
// `Authorization: Bearer <token>` and Directus enforces that identity's
// permissions. The token is either a Student's access token (per-request
// session client) or a service user's static token. Server-side only: a
// token must never reach the browser (ADR 0002).
export function createDirectusTokenClient(url: string, token: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest())
}
