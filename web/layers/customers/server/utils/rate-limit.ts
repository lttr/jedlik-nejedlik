// Per-IP guard for the unauthenticated routes that cost something on the
// other side: creating a CMS user, or making Directus send an e-mail.
// In-memory and per Nitro process — enough for the single-instance deploy,
// and deliberately not a captcha (spec, area 02).
import type { H3Event } from "h3"

const WINDOW_MS = 60 * 60 * 1000

// Above this many tracked IPs, drop the ones whose window has passed.
const PRUNE_THRESHOLD = 10_000

export interface RateLimit {
  // Separate budgets per flow, so registering does not use up reset requests.
  bucket: string
  max: number
  message: string
}

const attempts = new Map<string, number[]>()

function withinWindow(timestamps: number[], now: number): number[] {
  return timestamps.filter((at) => now - at < WINDOW_MS)
}

function prune(now: number): void {
  for (const [key, timestamps] of attempts) {
    if (withinWindow(timestamps, now).length === 0) {
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
    attempts.set(key, recent)
    throw authError(429, "rate_limited", message)
  }

  attempts.set(key, [...recent, now])
}

export const REGISTRATION_RATE_LIMIT: RateLimit = {
  bucket: "register",
  max: 5,
  message: authMessages.tooManyRegistrations,
}

export const PASSWORD_REQUEST_RATE_LIMIT: RateLimit = {
  bucket: "password-request",
  max: 5,
  message: authMessages.tooManyRequests,
}
