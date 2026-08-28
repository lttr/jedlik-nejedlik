import type { H3Event } from "h3"
import { createDirectusClient } from "../../shared/utils/directus"
import type { DirectusRestClient } from "../../shared/utils/directus"

let client: DirectusRestClient | null = null

// Anonymous server-side client for Nitro routes and SSR: exactly the access
// the public role has, and the only client the auth routes may use before a
// Student is authenticated. Stateless, so one per process — the per-request
// argument is only there to reach the runtime config.
export function getDirectusAnonymousServerClient(event: H3Event): DirectusRestClient {
  client ??= createDirectusClient(useRuntimeConfig(event).public.directusUrl)
  return client
}
