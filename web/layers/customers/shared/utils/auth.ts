import { z } from "zod"

// Identity codecs and pure helpers shared by the auth server routes and the
// forms that post to them. No Vue or Nitro APIs — both sides auto-import from
// here (see the layer conventions in .aiwork/2026-07-20_layers-scaffolding).

// Matches the instance's `auth_password_policy` (/^.{8,}$/), so the form never
// promises something Directus will reject.
export const PASSWORD_MIN_LENGTH = 8

export const LOGIN_PATH = "/prihlaseni"
export const ACCOUNT_PATH = "/ucet"

// Trim and lowercase before validating: e-mail is the identity (O-17), and a
// stray capital or trailing space must not create a second account.
const emailField = z.string().trim().toLowerCase().pipe(z.email())

export const LoginSchema = z.object({
  email: emailField,
  // Length is not checked on login — only registration sets the policy, and a
  // "too short" message here would leak which passwords are plausible.
  password: z.string().min(1),
})

export type LoginInput = z.infer<typeof LoginSchema>

/**
 * Sanitise a `?next=` value into a path we are willing to redirect to.
 *
 * Only same-site paths pass: a single leading slash, no backslashes. That
 * rejects absolute URLs (`https://evil.tld`), protocol-relative ones
 * (`//evil.tld`) and the backslash variants browsers normalise into them.
 */
export function safeNextPath(next: unknown, fallback: string = ACCOUNT_PATH): string {
  if (typeof next !== "string") {
    return fallback
  }
  if (!next.startsWith("/")) {
    return fallback
  }
  if (next.startsWith("//")) {
    return fallback
  }
  if (next.includes("\\")) {
    return fallback
  }
  return next
}

/**
 * Read one property off a value of unknown shape.
 *
 * Errors crossing the wire — ofetch failures, Directus responses — are `unknown`
 * by the time we inspect them, and asserting a shape onto them would be a lie
 * the type system then trusts. This narrows instead, so a surprising payload
 * yields `undefined` rather than a confident wrong answer.
 */
export function readUnknownProp(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return undefined
  }
  return Reflect.get(value, key)
}

/**
 * Pull the Czech message a server route put on an error out of whatever shape
 * ofetch hands back. The routes own the wording (see spec decision 6), so an
 * unrecognised shape means something other than our own route failed.
 */
export function authErrorMessage(
  error: unknown,
  fallback = "Omlouváme se, něco se pokazilo. Zkuste to prosím znovu.",
): string {
  const message = readUnknownProp(readUnknownProp(error, "data"), "message")
  return typeof message === "string" && message !== "" ? message : fallback
}
