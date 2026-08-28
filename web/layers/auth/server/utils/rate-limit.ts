// Per-IP guard for the unauthenticated auth routes. Directus's own
// `auth_login_attempts` (7) is per user, so it does nothing against
// credential stuffing spread across many accounts — this is the bound on
// that. Deliberately not a captcha (spec, area 02).
//
// Known limits, accepted for the single-instance deploy: the budget lives in
// memory in one Nitro process, so it resets on deploy and doubles if a second
// instance appears, and it trusts `X-Forwarded-For`, which a client controls
// unless the proxy hop is pinned.
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

// Timestamps are appended in order, so the newest one decides whether a key
// still has a live window — no need to build a filtered array to find out.
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
