import type { RequestEvent } from "nuxt/server"

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
