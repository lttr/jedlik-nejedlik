// Where a Student ends up after logging in or registering without an origin.
export const DEFAULT_AUTH_REDIRECT = "/muj-ucet"

// Only same-origin paths survive: anything else (absolute URL,
// protocol-relative `//evil.tld`, its backslash variants) would turn our
// login form into an open redirect.
export function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) {
    return DEFAULT_AUTH_REDIRECT
  }
  if (raw.startsWith("//") || raw.startsWith("/\\")) {
    return DEFAULT_AUTH_REDIRECT
  }
  return raw
}
