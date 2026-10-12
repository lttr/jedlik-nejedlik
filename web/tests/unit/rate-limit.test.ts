import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { requestEvent } from "./request-event"

// The limiter trusts `X-Forwarded-For` (single-instance deploy behind Coolify's
// proxy), so that is where the client address goes.
const event = requestEvent("/api/auth/login", {
  method: "POST",
  headers: { "x-forwarded-for": "203.0.113.7" },
})

const WINDOW_MS = 15 * 60 * 1000

describe("enforceRateLimit", () => {
  let bucket = 0

  function limit(max: number): { bucket: string; max: number; message: string } {
    return { bucket: `test-${bucket}`, max, message: "moc pokusů" }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-28T12:00:00Z"))
    bucket += 1
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows exactly `max` attempts and rejects the next one", () => {
    const rule = limit(3)
    const enforce = enforceRateLimit
    const spend = (): void => {
      enforce(event, rule)
    }
    expect(spend).not.toThrow("moc pokusů")
    expect(spend).not.toThrow("moc pokusů")
    expect(spend).not.toThrow("moc pokusů")
    expect(() => {
      enforceRateLimit(event, rule)
    }).toThrow("moc pokusů")
  })

  it("releases the window once it has passed, not merely closing it", () => {
    const rule = limit(2)
    enforceRateLimit(event, rule)
    enforceRateLimit(event, rule)
    expect(() => {
      enforceRateLimit(event, rule)
    }).toThrow("moc pokusů")

    // Still inside the window: one millisecond short must stay closed.
    vi.advanceTimersByTime(WINDOW_MS - 1)
    expect(() => {
      enforceRateLimit(event, rule)
    }).toThrow("moc pokusů")

    // And one millisecond later the oldest attempts have aged out.
    vi.advanceTimersByTime(1)
    expect(() => {
      enforceRateLimit(event, rule)
    }).not.toThrow("moc pokusů")
  })

  it("does not extend the window when a rejected attempt hammers it", () => {
    const rule = limit(1)
    enforceRateLimit(event, rule)

    // Half a window of rejected attempts must not push the release out.
    const enforce = enforceRateLimit
    const spend = (): void => {
      enforce(event, rule)
    }
    for (let i = 0; i < 10; i += 1) {
      vi.advanceTimersByTime(WINDOW_MS / 20)
      expect(spend).toThrow("moc pokusů")
    }

    vi.advanceTimersByTime(WINDOW_MS / 2)
    expect(() => {
      enforceRateLimit(event, rule)
    }).not.toThrow("moc pokusů")
  })

  it("keeps a separate budget per bucket", () => {
    const login = limit(1)
    const register = { ...login, bucket: `${login.bucket}-register` }
    enforceRateLimit(event, login)
    expect(() => {
      enforceRateLimit(event, login)
    }).toThrow("moc pokusů")
    expect(() => {
      enforceRateLimit(event, register)
    }).not.toThrow("moc pokusů")
  })
})
