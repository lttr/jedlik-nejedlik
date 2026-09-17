import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { GopayClient } from "../../layers/shop/shared/utils/gopay"

// The client calls `$fetch`, a Nuxt auto-import — a free identifier that
// resolves against `globalThis` — so stubbing the global runs the real
// module (prior art: rate-limit.test.ts).

interface StubCall {
  url: string
  options: {
    method: string
    headers: Record<string, string>
    body?: unknown
  }
}

const CONFIG = {
  baseUrl: "https://gw.sandbox.gopay.com",
  goid: "8123456789",
  clientId: "1652036967",
  clientSecret: "CKr7FyEE",
}

const PAYMENT_INPUT = {
  orderId: 42,
  priceCzk: 1490,
  courseTitle: "Jedlík v předškolním věku",
  payerEmail: "student@example.com",
  returnUrl: "https://www.jedlik-nejedlik.cz/objednavka/42/navrat",
  notificationUrl: "https://www.jedlik-nejedlik.cz/api/gopay/notify",
}

const calls: StubCall[] = []
let responses: unknown[] = []

function stubFetch(): void {
  vi.stubGlobal("$fetch", async (url: string, options: StubCall["options"]) => {
    calls.push({ url, options })
    return Promise.resolve(responses.shift() ?? {})
  })
}

function tokenResponse(accessToken = "tok-1", expiresIn = 1800): unknown {
  return { access_token: accessToken, expires_in: expiresIn, token_type: "bearer" }
}

function paymentResponse(state = "CREATED"): unknown {
  return { id: 3_000_000_001, state, gw_url: "https://gw.sandbox.gopay.com/gw/v3/abc" }
}

async function loadClient(): Promise<GopayClient> {
  stubFetch()
  vi.resetModules()
  const module = await import("../../layers/shop/server/utils/gopay-api-client")
  return module.createGopayApiClient(CONFIG)
}

function call(index: number): StubCall {
  return calls[index]
}

function tokenCalls(): StubCall[] {
  return calls.filter((made) => made.url.endsWith("/oauth2/token"))
}

function body(index: number): Record<string, unknown> {
  return call(index).options.body as Record<string, unknown>
}

describe("createGopayApiClient", () => {
  beforeEach(() => {
    calls.length = 0
    responses = []
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  describe("token", () => {
    it("asks for a client-credentials token with the payment-all scope", async () => {
      responses = [tokenResponse(), paymentResponse()]
      const client = await loadClient()
      await client.createPayment(PAYMENT_INPUT)

      const token = call(0)
      expect(token.url).toBe("https://gw.sandbox.gopay.com/api/oauth2/token")
      expect(token.options.method).toBe("POST")
      expect(token.options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded")
      expect(token.options.body).toBe("grant_type=client_credentials&scope=payment-all")
    })

    it("authenticates the token call with the client credentials, not a bearer", async () => {
      responses = [tokenResponse(), paymentResponse()]
      const client = await loadClient()
      await client.createPayment(PAYMENT_INPUT)

      const credentials = Buffer.from(`${CONFIG.clientId}:${CONFIG.clientSecret}`).toString(
        "base64",
      )
      expect(call(0).options.headers.Authorization).toBe(`Basic ${credentials}`)
    })

    it("reuses the token across calls", async () => {
      responses = [tokenResponse(), paymentResponse(), paymentResponse("PAID")]
      const client = await loadClient()
      await client.createPayment(PAYMENT_INPUT)
      await client.inquirePayment("3000000001")

      expect(tokenCalls()).toHaveLength(1)
    })

    it("fetches a fresh token two minutes before the old one expires", async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-09-15T10:00:00Z"))
      responses = [
        tokenResponse("tok-1"),
        paymentResponse(),
        tokenResponse("tok-2"),
        paymentResponse("PAID"),
      ]
      const client = await loadClient()
      await client.createPayment(PAYMENT_INPUT)

      // 30 minutes minus two, the moment the cached token stops counting.
      vi.setSystemTime(new Date("2026-09-15T10:28:00Z"))
      await client.inquirePayment("3000000001")

      expect(tokenCalls()).toHaveLength(2)
      expect(call(3).options.headers.Authorization).toBe("Bearer tok-2")
    })
  })

  describe("createPayment", () => {
    it("posts the Payment with the amount in haléře and the Czech gateway language", async () => {
      responses = [tokenResponse(), paymentResponse()]
      const client = await loadClient()
      await client.createPayment(PAYMENT_INPUT)

      expect(call(1).url).toBe("https://gw.sandbox.gopay.com/api/payments/payment")
      expect(call(1).options.method).toBe("POST")
      expect(call(1).options.headers.Authorization).toBe("Bearer tok-1")
      expect(body(1)).toMatchObject({
        amount: 149_000,
        currency: "CZK",
        lang: "CS",
        order_number: "42",
        order_description: PAYMENT_INPUT.courseTitle,
        target: { type: "ACCOUNT", goid: CONFIG.goid },
        payer: { contact: { email: PAYMENT_INPUT.payerEmail } },
        callback: {
          return_url: PAYMENT_INPUT.returnUrl,
          notification_url: PAYMENT_INPUT.notificationUrl,
        },
      })
    })

    it("sends the Course as the single item of the Payment", async () => {
      responses = [tokenResponse(), paymentResponse()]
      const client = await loadClient()
      await client.createPayment(PAYMENT_INPUT)

      expect(body(1).items).toEqual([
        { type: "ITEM", name: PAYMENT_INPUT.courseTitle, amount: 149_000, count: 1 },
      ])
    })

    it("returns the Payment id as a string, whatever GoPay sends", async () => {
      responses = [tokenResponse(), paymentResponse()]
      const client = await loadClient()

      expect(await client.createPayment(PAYMENT_INPUT)).toEqual({
        id: "3000000001",
        state: "CREATED",
        gwUrl: "https://gw.sandbox.gopay.com/gw/v3/abc",
      })
    })

    it("refuses a callback URL over GoPay's 512-character cap", async () => {
      responses = [tokenResponse(), paymentResponse()]
      const client = await loadClient()

      await expect(
        client.createPayment({
          ...PAYMENT_INPUT,
          returnUrl: `https://www.jedlik-nejedlik.cz/${"x".repeat(512)}`,
        }),
      ).rejects.toThrow(/512/)
    })

    it("refuses an answer that is not a Payment", async () => {
      responses = [tokenResponse(), { id: 1, state: "WAT" }]
      const client = await loadClient()

      await expect(client.createPayment(PAYMENT_INPUT)).rejects.toThrow(/state/)
    })
  })

  describe("inquirePayment", () => {
    it("reads the Payment state back from GoPay", async () => {
      responses = [tokenResponse(), paymentResponse("PAID")]
      const client = await loadClient()

      expect(await client.inquirePayment("3000000001")).toMatchObject({
        id: "3000000001",
        state: "PAID",
      })
      expect(call(1).url).toBe("https://gw.sandbox.gopay.com/api/payments/payment/3000000001")
      expect(call(1).options.method).toBe("GET")
    })
  })

  describe("refundPayment", () => {
    it("posts the refunded amount in haléře as a form body", async () => {
      responses = [tokenResponse(), { id: 3_000_000_001, result: "FINISHED" }]
      const client = await loadClient()
      await client.refundPayment("3000000001", 1490)

      expect(call(1).url).toBe(
        "https://gw.sandbox.gopay.com/api/payments/payment/3000000001/refund",
      )
      expect(call(1).options.method).toBe("POST")
      expect(call(1).options.headers["Content-Type"]).toBe("application/x-www-form-urlencoded")
      expect(call(1).options.body).toBe("amount=149000")
    })
  })
})
