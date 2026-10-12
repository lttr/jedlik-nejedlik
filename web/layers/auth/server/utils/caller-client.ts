import type { RequestEvent } from "nuxt/server"
import { getAccountDirectusClient } from "./account-session"
import { getDirectusAnonymousServerClient } from "#layers/directus/server/utils/directus-server"
import type { DirectusRestClient } from "#layers/directus/shared/utils/directus"

// An optionally-authenticated read (ADR 0004): the caller's own session when
// there is one, the public role otherwise. Directus decides what comes back, so
// no status logic lives in app code.
export async function getCallerDirectusClient(event: RequestEvent): Promise<DirectusRestClient> {
  return (await getAccountDirectusClient(event)) ?? getDirectusAnonymousServerClient()
}
