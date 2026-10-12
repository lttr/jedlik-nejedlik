import type { RequestEvent } from "nuxt/server"

// A `RequestEvent` as every server runtime hands it to a `nuxt/server`
// handler: a web `Request`, its URL, response headers and a context.
export function requestEvent(
  path = "/",
  init: RequestInit & { headers?: Record<string, string> } = {},
): RequestEvent {
  const url = new URL(path, "https://www.jedlik-nejedlik.cz")
  return {
    req: new Request(url, init),
    url,
    res: { headers: new Headers() },
    context: {},
  }
}
