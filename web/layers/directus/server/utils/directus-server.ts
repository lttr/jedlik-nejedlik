import type { H3Event } from "h3"
import { createDirectusClient } from "../../shared/utils/directus"
import type { DirectusRestClient } from "../../shared/utils/directus"

let client: DirectusRestClient | null = null

// A client with no token, so Directus grants it the public role's permissions
// and nothing more. This is what the auth routes use before a session exists.
// It holds no per-request state, so one instance is cached for the whole
// process and the event is only there to reach the runtime config.
export function getDirectusAnonymousServerClient(event: H3Event): DirectusRestClient {
  client ??= createDirectusClient(useRuntimeConfig(event).public.directusUrl)
  return client
}
