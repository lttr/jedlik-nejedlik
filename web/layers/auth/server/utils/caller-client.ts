import type { H3Event } from "h3"

// An optionally-authenticated read (ADR 0004): the caller's own session when
// there is one, the public role otherwise. Directus decides what comes back, so
// no status logic lives in app code.
export async function getCallerDirectusClient(event: H3Event): Promise<DirectusRestClient> {
  return (await getAccountDirectusClient(event)) ?? getDirectusAnonymousServerClient(event)
}
