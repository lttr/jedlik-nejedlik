import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import accountSessionMiddleware from "#layers/auth/server/middleware/account-session"
import {
  dropAccountSession,
  readAccountSession,
  writeAccountSession,
} from "#layers/auth/server/utils/session-store"
import type { Account, AccountSecrets } from "#layers/auth/shared/types/account"
import { requestEvent } from "./request-event"
import type { RequestEvent } from "nuxt/server"

// Outside a Nuxt build, `nuxt/server` reads its runtime config from this
// module; the session seals with a password derived from `appSecret`.
vi.mock("nuxt/internal/server-runtime-config", () => ({
  useRuntimeConfig: () => ({ appSecret: "test-secret-".repeat(4), public: {} }),
}))

const DAY_MS = 24 * 60 * 60 * 1000

const account: Account = { email: "student@example.com" }

function secrets(): AccountSecrets {
  return {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    // Far ahead, so the middleware never asks Directus for a refresh.
    accessTokenExpiresAt: Date.now() + 365 * DAY_MS,
  }
}

// The next request, as the browser sends it after `event`'s response.
function nextRequest(event: RequestEvent, path = "/"): RequestEvent {
  const cookies = event.res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0] ?? "")
    .filter((pair) => !pair.endsWith("="))
  return requestEvent(path, { headers: { cookie: cookies.join("; ") } })
}

function sessionCookie(event: RequestEvent): string | undefined {
  return event.res.headers.getSetCookie().find((cookie) => cookie.startsWith("nuxt-session="))
}

describe("the session store", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-10-12T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("reads back the Account and the secrets it wrote", async () => {
    const login = requestEvent("/api/auth/login", { method: "POST" })
    const written = secrets()
    await writeAccountSession(login, account, written)

    expect(await readAccountSession(nextRequest(login))).toEqual({ account, secrets: written })
  })

  it("seals the cookie the way ADR 0002 requires", async () => {
    const login = requestEvent("/api/auth/login", { method: "POST" })
    await writeAccountSession(login, account, secrets())

    const cookie = sessionCookie(login) ?? ""
    expect(cookie).toMatch(/; HttpOnly/i)
    expect(cookie).toMatch(/; Secure/i)
    expect(cookie).toMatch(/; SameSite=Lax/i)
    expect(cookie).toContain(`Max-Age=${30 * 24 * 60 * 60}`)
    expect(cookie).not.toContain("access-token")
    expect(cookie).not.toContain(account.email)
  })

  it("reads neither after the session is dropped", async () => {
    const login = requestEvent("/api/auth/login", { method: "POST" })
    await writeAccountSession(login, account, secrets())
    const logout = nextRequest(login)
    await dropAccountSession(logout)

    expect(await readAccountSession(logout)).toEqual({ account: undefined, secrets: undefined })
    expect(await readAccountSession(nextRequest(logout))).toEqual({
      account: undefined,
      secrets: undefined,
    })
  })

  it("mints no cookie for a request that carries none", async () => {
    const visit = requestEvent("/")
    expect(await readAccountSession(visit)).toEqual({ account: undefined, secrets: undefined })
    expect(sessionCookie(visit)).toBeUndefined()
  })

  it("expires 30 days after the last write, not after the first", async () => {
    const login = requestEvent("/api/auth/login", { method: "POST" })
    await writeAccountSession(login, account, secrets())

    // A token refresh on day 20 re-seals the session…
    vi.setSystemTime(Date.now() + 20 * DAY_MS)
    const refresh = nextRequest(login)
    await writeAccountSession(refresh, account, secrets())

    // …so on day 40 it is alive, while the cookie from login is not.
    vi.setSystemTime(Date.now() + 20 * DAY_MS)
    expect((await readAccountSession(nextRequest(refresh))).account).toEqual(account)
    expect((await readAccountSession(nextRequest(login))).account).toBeUndefined()
  })

  it("hands the page render the Account and never the secrets", async () => {
    const login = requestEvent("/api/auth/login", { method: "POST" })
    await writeAccountSession(login, account, secrets())
    const page = nextRequest(login, "/muj-ucet")

    await accountSessionMiddleware(page)

    expect(page.context).toEqual({ account })
    expect(JSON.stringify(page.context)).not.toMatch(/token/i)
  })
})
