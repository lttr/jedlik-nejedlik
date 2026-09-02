import type { H3Event } from "h3"
import { createDirectusClient } from "../../shared/utils/directus"
import type { DirectusRestClient } from "../../shared/utils/directus"

let client: DirectusRestClient | null = null

// Exactly the public role's access, and the only client the auth routes may
// use before a Student is authenticated. Stateless, so one per process; the
// event only reaches the runtime config.
export function getDirectusAnonymousServerClient(event: H3Event): DirectusRestClient {
  client ??= createDirectusClient(useRuntimeConfig(event).public.directusUrl)
  return client
}
