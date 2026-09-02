// Per-IP guard for the unauthenticated auth routes. Directus's own
// `auth_login_attempts` is per user, so it does nothing against credential
// stuffing spread across accounts. Deliberately not a captcha (spec, area 02).
//
// Accepted for the single-instance deploy: the budget is in-process memory
// (resets on deploy, doubles with a second instance) and trusts
// `X-Forwarded-For`.
import type { H3Event } from "h3"

const WINDOW_MS = 15 * 60 * 1000

// Above this many tracked IPs, drop the ones whose window has passed.
const PRUNE_THRESHOLD = 10_000

export interface RateLimit {
  // Separate budgets per flow, so logging in does not use up registrations.
  bucket: string
  max: number
  message: string
}

const attempts = new Map<string, number[]>()

function withinWindow(timestamps: number[], now: number): number[] {
  return timestamps.filter((at) => now - at < WINDOW_MS)
}

let lastPrune = 0

// Timestamps are appended in order, so the newest decides whether the window
// is still live.
function prune(now: number): void {
  if (now - lastPrune < WINDOW_MS) {
    return
  }
  lastPrune = now
  for (const [key, timestamps] of attempts) {
    if (now - (timestamps.at(-1) ?? 0) >= WINDOW_MS) {
      attempts.delete(key)
    }
  }
}

export function enforceRateLimit(event: H3Event, { bucket, max, message }: RateLimit): void {
  const key = `${bucket}:${getRequestIP(event, { xForwardedFor: true }) ?? "unknown"}`
  const now = Date.now()

  if (attempts.size > PRUNE_THRESHOLD) {
    prune(now)
  }

  const recent = withinWindow(attempts.get(key) ?? [], now)
  if (recent.length >= max) {
    // Do not extend the window on a rejected attempt: hammering the endpoint
    // must not make the lockout permanent.
    attempts.set(key, recent)
    throw authError(429, "rate_limited", message)
  }

  attempts.set(key, [...recent, now])
}

export const LOGIN_RATE_LIMIT: RateLimit = {
  bucket: "login",
  max: 20,
  message: authMessages.tooManyLogins,
}

export const REGISTER_RATE_LIMIT: RateLimit = {
  bucket: "register",
  max: 10,
  message: authMessages.tooManyRegistrations,
}

// One-shot action; only has to survive a few page reloads.
export const VERIFY_EMAIL_RATE_LIMIT: RateLimit = {
  bucket: "verify-email",
  max: 20,
  message: authMessages.tooManyVerifications,
}

// Sends mail to an address the requester names, so tighter than registration.
export const PASSWORD_REQUEST_RATE_LIMIT: RateLimit = {
  bucket: "password-request",
  max: 10,
  message: authMessages.tooManyResetRequests,
}

// Needs an unguessable token and sends nothing; only has to absorb a Student
// mistyping a too-short password.
export const PASSWORD_RESET_RATE_LIMIT: RateLimit = {
  bucket: "password-reset",
  max: 20,
  message: authMessages.tooManyResets,
}

// The current-password check is a Directus login, which counts against
// `auth_login_attempts` and can suspend the account. A tight budget keeps a
// hijacked session from spending someone else's attempts.
export const CHANGE_PASSWORD_RATE_LIMIT: RateLimit = {
  bucket: "change-password",
  max: 10,
  message: authMessages.tooManyPasswordChanges,
}
