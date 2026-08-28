// Where a Student ends up after logging in without an origin.
export const DEFAULT_AUTH_REDIRECT = "/muj-ucet"

// Resolving against a throwaway origin is what makes this safe: every way of
// escaping to another host — an absolute URL, `//evil.tld`, its backslash and
// control-character variants — changes the origin, and the URL parser knows
// all of them so we don't have to enumerate them.
const PLACEHOLDER_ORIGIN = "https://redirect.invalid"

// Only same-origin paths survive; anything else would turn our login form
// into an open redirect.
export function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string" || raw === "") {
    return DEFAULT_AUTH_REDIRECT
  }

  try {
    const url = new URL(raw, PLACEHOLDER_ORIGIN)
    return url.origin === PLACEHOLDER_ORIGIN
      ? `${url.pathname}${url.search}${url.hash}`
      : DEFAULT_AUTH_REDIRECT
  } catch {
    return DEFAULT_AUTH_REDIRECT
  }
}
