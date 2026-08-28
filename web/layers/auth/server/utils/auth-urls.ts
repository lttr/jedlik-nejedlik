import type { H3Event } from "h3"

// The absolute URL of one of our own auth pages, for Directus to put in an
// e-mail it sends (registration verification now, password reset next). Built
// from the configured site URL rather than the request's own origin, so a
// forged Host header can never steer where the e-mail points — and Directus
// only accepts URLs named in its own allow lists anyway.
export function authPageUrl(event: H3Event, path: string): string {
  return new URL(path, getSiteConfig(event).url).href
}
