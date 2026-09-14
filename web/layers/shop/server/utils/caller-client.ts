import type { H3Event } from "h3"

// The shop's read path (ADR 0004): the caller's own session when there is
// one, the public role otherwise. Directus then decides what comes back, so
// an Author sees their drafts and a visitor or Student sees published
// Courses only, with no status logic in app code.
export async function getCallerDirectusClient(event: H3Event): Promise<DirectusRestClient> {
  return (await getAccountDirectusClient(event)) ?? getDirectusAnonymousServerClient(event)
}
