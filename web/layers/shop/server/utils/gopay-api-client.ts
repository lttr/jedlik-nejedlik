import { z } from "zod"

import { GopayPaymentStateSchema, assertCallbackUrl, toHalere } from "../../shared/utils/gopay"
import type { CreateGopayPaymentInput, GopayClient, GopayPayment } from "../../shared/utils/gopay"

// The real GoPay, over raw `$fetch`. GoPay ships no Node SDK and the
// third-party packages are years stale (spec, „GoPay client"), so the four
// calls are written out here: token, create, inquire, refund. Sandbox and
// production differ only in `baseUrl`.

// The credentials are `string | number` because that is how they arrive:
// Nuxt reads every env override through `destr`, so an all-digits GoID or
// client id lands in the runtime config as a number. GoPay takes either.
export interface GopayApiConfig {
  baseUrl: string
  goid: string | number
  clientId: string | number
  clientSecret: string | number
}

// GoPay's access token lives 30 minutes. Renew it two minutes early so a
// call that starts just before the edge cannot arrive just after it.
const TOKEN_REFRESH_MARGIN_MS = 2 * 60 * 1000

const TokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
})

// The id is a number on the wire and a string everywhere here: it is stored
// in the Order's `gopay_payment_id`, which Directus types as a string.
const PaymentSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    state: GopayPaymentStateSchema,
    gw_url: z.string().optional(),
  })
  .transform((payment): GopayPayment => ({
    id: String(payment.id),
    state: payment.state,
    gwUrl: payment.gw_url ?? "",
  }))

function createTokenSource(config: GopayApiConfig): () => Promise<string> {
  let token: { value: string; expiresAt: number } | undefined
  // The fetch itself, not its result: at a cold start and at every renewal
  // several calls want the token at once, and each asking GoPay for its own
  // would be the same request three times over.
  let inFlight: Promise<string> | undefined

  async function requestToken(): Promise<string> {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")
    const raw: unknown = await $fetch(`${config.baseUrl}/api/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=payment-all",
    })
    const parsed = TokenSchema.parse(raw)
    token = {
      value: parsed.access_token,
      expiresAt: Date.now() + parsed.expires_in * 1000 - TOKEN_REFRESH_MARGIN_MS,
    }
    return parsed.access_token
  }

  async function fetchToken(): Promise<string> {
    const shared = inFlight
    if (shared !== undefined) {
      return shared
    }
    const pending = requestToken()
    inFlight = pending
    try {
      return await pending
    } finally {
      inFlight = undefined
    }
  }

  return async function authorization(): Promise<string> {
    const cached = token
    const value =
      cached !== undefined && Date.now() < cached.expiresAt ? cached.value : await fetchToken()
    return `Bearer ${value}`
  }
}

export function createGopayApiClient(config: GopayApiConfig): GopayClient {
  const authorization = createTokenSource(config)

  async function authorized(
    method: "GET" | "POST",
    path: string,
    body?: string | Record<string, unknown>,
    contentType = "application/json",
  ): Promise<unknown> {
    return $fetch<unknown>(path, {
      method,
      headers: {
        Authorization: await authorization(),
        Accept: "application/json",
        "Content-Type": contentType,
      },
      body,
    })
  }

  return {
    async createPayment(input: CreateGopayPaymentInput): Promise<GopayPayment> {
      assertCallbackUrl("return_url", input.returnUrl)
      assertCallbackUrl("notification_url", input.notificationUrl)
      const amount = toHalere(input.priceCzk)
      const raw = await authorized("POST", `${config.baseUrl}/api/payments/payment`, {
        payer: { contact: { email: input.payerEmail } },
        target: { type: "ACCOUNT", goid: config.goid },
        amount,
        currency: "CZK",
        order_number: String(input.orderId),
        order_description: input.courseTitle,
        items: [{ type: "ITEM", name: input.courseTitle, amount, count: 1 }],
        callback: {
          return_url: input.returnUrl,
          notification_url: input.notificationUrl,
        },
        lang: "CS",
      })
      return PaymentSchema.parse(raw)
    },

    async inquirePayment(paymentId: string): Promise<GopayPayment> {
      const raw = await authorized("GET", `${config.baseUrl}/api/payments/payment/${paymentId}`)
      return PaymentSchema.parse(raw)
    },

    async refundPayment(paymentId: string, amountCzk: number): Promise<void> {
      await authorized(
        "POST",
        `${config.baseUrl}/api/payments/payment/${paymentId}/refund`,
        `amount=${toHalere(amountCzk)}`,
        "application/x-www-form-urlencoded",
      )
    },
  }
}
