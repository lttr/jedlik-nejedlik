import type { H3Event } from "h3"

// Absolute URL of one of our auth pages, for Directus to put in an e-mail.
// Built from the configured site URL rather than the request origin, so a
// forged Host header cannot steer where the e-mail points.
export function authPageUrl(event: H3Event, path: string): string {
  return new URL(path, getSiteConfig(event).url).href
}
