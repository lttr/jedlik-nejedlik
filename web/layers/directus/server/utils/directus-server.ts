import type { H3Event } from "h3"
import { createDirectusClient } from "#layers/directus/shared/utils/directus"
import type { DirectusRestClient } from "#layers/directus/shared/utils/directus"

let client: DirectusRestClient | null = null

// A client with no token, so Directus grants it the public role's permissions
// and nothing more. It holds no per-request state, so one instance is cached
// for the whole process.
export function getDirectusAnonymousServerClient(event: H3Event): DirectusRestClient {
  client ??= createDirectusClient(useRuntimeConfig(event).public.directusUrl)
  return client
}
