// Where a Student ends up after logging in without an origin.
export const DEFAULT_AUTH_REDIRECT = "/muj-ucet"

// The page the link in Directus's verification e-mail lands on. Named here
// rather than in the registration route because the server has to build the
// absolute form of it and the page has to strip its token — two sides of one
// contract.
export const VERIFY_EMAIL_PATH = "/overeni-emailu"

// The page the link in Directus's password-reset e-mail lands on — the same
// page that hands out those links when it is opened without a `?token=`.
// Named here for the same reason as VERIFY_EMAIL_PATH: the reset route builds
// the absolute form of it and the page strips its token.
export const RESET_PASSWORD_PATH = "/obnova-hesla"

// How /overeni-emailu tells the login form that the account was just
// activated. A bare literal on both sides would agree only by luck.
export const EMAIL_VERIFIED_QUERY = "overeno"

// The same trick for /obnova-hesla: the reset form sends the Student to the
// login page and this says why they are there.
export const PASSWORD_CHANGED_QUERY = "heslo-zmeneno"

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
