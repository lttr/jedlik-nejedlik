import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// `enforceRateLimit` calls `getRequestIP` and `authError` as Nuxt
// auto-imports, plain free identifiers that resolve against `globalThis`, so
// stubbing them is enough to run the real module.
const IP = "203.0.113.7"

interface RateLimitModule {
  enforceRateLimit: (
    event: unknown,
    limit: { bucket: string; max: number; message: string },
  ) => void
}

async function loadModule(): Promise<RateLimitModule> {
  vi.stubGlobal("getRequestIP", () => IP)
  vi.stubGlobal("authError", (status: number, code: string, message: string) => {
    const error = new Error(message) as Error & { statusCode: number; code: string }
    error.statusCode = status
    error.code = code
    return error
  })
  vi.stubGlobal("authMessages", new Proxy({}, { get: (_t, key) => String(key) }))
  vi.resetModules()
  return (await import("../../layers/auth/server/utils/rate-limit")) as unknown as RateLimitModule
}

const WINDOW_MS = 15 * 60 * 1000

describe("enforceRateLimit", () => {
  let enforceRateLimit: RateLimitModule["enforceRateLimit"]
  let bucket = 0

  function limit(max: number): { bucket: string; max: number; message: string } {
    return { bucket: `test-${bucket}`, max, message: "moc pokusů" }
  }

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-28T12:00:00Z"))
    bucket += 1
    ;({ enforceRateLimit } = await loadModule())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("allows exactly `max` attempts and rejects the next one", () => {
    const rule = limit(3)
    const enforce = enforceRateLimit
    const spend = (): void => {
      enforce({}, rule)
    }
    expect(spend).not.toThrow("moc pokusů")
    expect(spend).not.toThrow("moc pokusů")
    expect(spend).not.toThrow("moc pokusů")
    expect(() => {
      enforceRateLimit({}, rule)
    }).toThrow("moc pokusů")
  })

  it("releases the window once it has passed, not merely closing it", () => {
    const rule = limit(2)
    enforceRateLimit({}, rule)
    enforceRateLimit({}, rule)
    expect(() => {
      enforceRateLimit({}, rule)
    }).toThrow("moc pokusů")

    // Still inside the window: one millisecond short must stay closed.
    vi.advanceTimersByTime(WINDOW_MS - 1)
    expect(() => {
      enforceRateLimit({}, rule)
    }).toThrow("moc pokusů")

    // And one millisecond later the oldest attempts have aged out.
    vi.advanceTimersByTime(1)
    expect(() => {
      enforceRateLimit({}, rule)
    }).not.toThrow("moc pokusů")
  })

  it("does not extend the window when a rejected attempt hammers it", () => {
    const rule = limit(1)
    enforceRateLimit({}, rule)

    // Half a window of rejected attempts must not push the release out.
    const enforce = enforceRateLimit
    const spend = (): void => {
      enforce({}, rule)
    }
    for (let i = 0; i < 10; i += 1) {
      vi.advanceTimersByTime(WINDOW_MS / 20)
      expect(spend).toThrow("moc pokusů")
    }

    vi.advanceTimersByTime(WINDOW_MS / 2)
    expect(() => {
      enforceRateLimit({}, rule)
    }).not.toThrow("moc pokusů")
  })

  it("keeps a separate budget per bucket", () => {
    const login = limit(1)
    const register = { ...login, bucket: `${login.bucket}-register` }
    enforceRateLimit({}, login)
    expect(() => {
      enforceRateLimit({}, login)
    }).toThrow("moc pokusů")
    expect(() => {
      enforceRateLimit({}, register)
    }).not.toThrow("moc pokusů")
  })
})
