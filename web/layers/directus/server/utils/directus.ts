import type { DirectusClient, RestClient } from "@directus/sdk"
import type { Schema } from "../../shared/types/directus"

// Nitro-side Directus client. Unauthenticated by construction: server code that
// acts on behalf of a Student wraps individual commands in the SDK's
// `withToken`, so one client can serve concurrent requests for different users
// without any per-request state. See area 02's spec, decision 2.
let client: (DirectusClient<Schema> & RestClient<Schema>) | undefined

export function getServerDirectusClient(): DirectusClient<Schema> & RestClient<Schema> {
  client ??= createDirectusClient(useRuntimeConfig().public.directusUrl)
  return client
}
