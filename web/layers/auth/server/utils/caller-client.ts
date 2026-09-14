import type { H3Event } from "h3"

// An optionally-authenticated read (ADR 0004): the caller's own session when
// there is one, the public role otherwise. Directus then decides what comes
// back, so an Author sees their drafts and a visitor or Student sees
// published rows only, with no status logic in app code. Lives next to the
// other two session clients because nothing about it is shop-specific.
export async function getCallerDirectusClient(event: H3Event): Promise<DirectusRestClient> {
  return (await getAccountDirectusClient(event)) ?? getDirectusAnonymousServerClient(event)
}
