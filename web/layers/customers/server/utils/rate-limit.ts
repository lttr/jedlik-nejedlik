// Per-IP guard for the register route — the one unauthenticated endpoint
// that writes to the CMS. In-memory and per Nitro process: enough for the
// single-instance deploy, and deliberately not a captcha (spec, area 02).
import type { H3Event } from "h3"

const WINDOW_MS = 60 * 60 * 1000
const MAX_REGISTRATIONS_PER_WINDOW = 5

// Above this many tracked IPs, drop the ones whose window has passed.
const PRUNE_THRESHOLD = 10_000

const registrations = new Map<string, number[]>()

function withinWindow(timestamps: number[], now: number): number[] {
  return timestamps.filter((at) => now - at < WINDOW_MS)
}

function prune(now: number): void {
  for (const [ip, timestamps] of registrations) {
    if (withinWindow(timestamps, now).length === 0) {
      registrations.delete(ip)
    }
  }
}

export function enforceRegistrationRateLimit(event: H3Event): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown"
  const now = Date.now()

  if (registrations.size > PRUNE_THRESHOLD) {
    prune(now)
  }

  const recent = withinWindow(registrations.get(ip) ?? [], now)
  if (recent.length >= MAX_REGISTRATIONS_PER_WINDOW) {
    registrations.set(ip, recent)
    throw authError(429, "too_many_registrations", authMessages.tooManyRegistrations)
  }

  registrations.set(ip, [...recent, now])
}
