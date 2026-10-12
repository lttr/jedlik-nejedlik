import { useRuntimeConfig } from "nuxt/server"
import { createDirectusClient } from "#layers/directus/shared/utils/directus"
import type { DirectusRestClient } from "#layers/directus/shared/utils/directus"

let client: DirectusRestClient | null = null

// A client with no token, so Directus grants it the public role's permissions
// and nothing more. It holds no per-request state, so one instance is cached
// for the whole process.
export function getDirectusAnonymousServerClient(): DirectusRestClient {
  client ??= createDirectusClient(useRuntimeConfig().public.directusUrl)
  return client
}
