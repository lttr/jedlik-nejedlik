import { createDirectus, rest, staticToken } from "@directus/sdk"
import type { DirectusClient, RestClient } from "@directus/sdk"
import type { Schema } from "../types/directus"

export type DirectusRestClient = DirectusClient<Schema> & RestClient<Schema>

// Pure factory — no Vue/Nitro APIs, usable from both app and server code.
export function createDirectusClient(url: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(rest())
}

// Whose token it is, and where it came from, is not this layer's business.
export function createDirectusTokenClient(url: string, token: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest())
}
