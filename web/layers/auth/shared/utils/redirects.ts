// Where a Student ends up after logging in without an origin.
export const DEFAULT_AUTH_REDIRECT = "/muj-ucet"

// Landing page of the verification e-mail. Shared because the server builds
// its absolute form and the page strips its token.
export const VERIFY_EMAIL_PATH = "/overeni-emailu"

// Landing page of the password-reset e-mail, shared for the same reason.
export const RESET_PASSWORD_PATH = "/obnova-hesla"

// Query flags the e-mail pages set when sending the Student to the login
// form, so it can say why they are there.
export const EMAIL_VERIFIED_QUERY = "overeno"

export const PASSWORD_CHANGED_QUERY = "heslo-zmeneno"

// Resolving against a throwaway origin makes the check safe: every escape to
// another host (absolute URL, `//evil.tld`, backslash and control-character
// variants) changes the origin, and the URL parser knows them all.
const PLACEHOLDER_ORIGIN = "https://redirect.invalid"

// Only same-origin paths survive, or the login form is an open redirect.
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
