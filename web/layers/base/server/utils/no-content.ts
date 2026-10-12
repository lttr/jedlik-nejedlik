import { setResponseStatus } from "nuxt/server"
import type { RequestEvent } from "nuxt/server"

// A 204 on every server runtime: h3 v1 answers a `null` body with 204 by
// itself, h3 v2 sends an empty body with whatever status was set.
export function noContent(event: RequestEvent): null {
  setResponseStatus(event, 204)
  return null
}
