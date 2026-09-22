import { createDirectus, rest, staticToken } from "@directus/sdk"
import type { DirectusClient, RestClient } from "@directus/sdk"
import type { Schema } from "../types/directus"

export type DirectusRestClient = DirectusClient<Schema> & RestClient<Schema>

export function createDirectusClient(url: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(rest())
}

export function createDirectusTokenClient(url: string, token: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest())
}
