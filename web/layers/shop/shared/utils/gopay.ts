import { z } from "zod"

import type { Order } from "../../../directus/shared/utils/schemas"

// The vocabulary of the payment gateway, in one place and pure, so the mock
// and the real client agree on it by construction.

// GoPay's payment states. `AUTHORIZED` (pre-authorised card) and the two
// refund states never occur in this area's flow, but they are part of the
// enum GoPay answers with, and a state we cannot name would fail the parse.
export const GopayPaymentStateSchema = z.enum([
  "CREATED",
  "PAYMENT_METHOD_CHOSEN",
  "PAID",
  "AUTHORIZED",
  "CANCELED",
  "TIMEOUTED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
])

export type GopayPaymentState = z.output<typeof GopayPaymentStateSchema>

// GoPay charges in haléře; every price on this site is whole koruny.
const HALERE_PER_KORUNA = 100

export function toHalere(priceCzk: number): number {
  if (!Number.isInteger(priceCzk) || priceCzk < 0) {
    throw new Error(`GoPay amount must be whole koruny, zero or more; got ${priceCzk}`)
  }
  return priceCzk * HALERE_PER_KORUNA
}

// `undefined` is „nothing changes". See docs/shop.md, „Payment and GoPay".
export function orderStatusForPaymentState(state: GopayPaymentState): Order["status"] | undefined {
  if (state === "PAID") {
    return "paid"
  }
  if (state === "CANCELED" || state === "TIMEOUTED") {
    return "cancelled"
  }
  return undefined
}

// Whether the Student can still pay this Payment, which is what makes an
// abandoned Order reusable instead of replaced (spec, „Order flow").
export function isPaymentLive(state: GopayPaymentState): boolean {
  return state === "CREATED" || state === "PAYMENT_METHOD_CHOSEN"
}

// GoPay refuses a callback URL longer than this.
export const GOPAY_CALLBACK_URL_MAX_LENGTH = 512

export interface GopayPayment {
  id: string
  state: GopayPaymentState
  gwUrl: string
}

// The amount is `priceCzk` — re-read from the Course by the caller, never
// taken from the browser — and converted to haléře here. Both callback URLs
// are absolute and built from the site config, not from the request Host.
export interface CreateGopayPaymentInput {
  orderId: number
  priceCzk: number
  courseTitle: string
  payerEmail: string
  returnUrl: string
  notificationUrl: string
}

// The seam the Checkout and the settlement talk to. Two implementations:
// `createGopayApiClient` (sandbox and production) and `createGopayMockClient`
// (dev), chosen by `getGopayClient(event)` from `gopay.env`.
export interface GopayClient {
  createPayment: (input: CreateGopayPaymentInput) => Promise<GopayPayment>
  inquirePayment: (paymentId: string) => Promise<GopayPayment>
  // Implemented for completeness; nothing in this area calls it, refunds are
  // made by hand in GoPay's admin.
  refundPayment: (paymentId: string, amountCzk: number) => Promise<void>
}

export function assertCallbackUrl(label: string, value: string): void {
  if (value.length > GOPAY_CALLBACK_URL_MAX_LENGTH) {
    throw new Error(
      `GoPay ${label} may be at most ${GOPAY_CALLBACK_URL_MAX_LENGTH} characters; got ${value.length}`,
    )
  }
}
