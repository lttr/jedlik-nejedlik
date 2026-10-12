import {
  createError,
  defineEventHandler,
  getRequestURL,
  getRouterParam,
  sendRedirect,
} from "nuxt/server"
import type { RequestEvent } from "nuxt/server"
import { z } from "zod"

import { recordMockPaymentState } from "#layers/shop/server/utils/gopay-mock-client"
import type { MockPayment } from "#layers/shop/server/utils/gopay-mock-client"
import type { GopayPaymentState } from "#layers/shop/shared/utils/gopay"
import { readValidBody } from "#layers/base/server/utils/valid-body"

// See docs/shop.md, „Mock gateway".
const DecisionSchema = z.object({ action: z.enum(["pay", "cancel", "choose"]) })

const MOCK_DECISION_STATES = {
  pay: "PAID",
  cancel: "CANCELED",
  choose: "PAYMENT_METHOD_CHOSEN",
} as const satisfies Record<"pay" | "cancel" | "choose", GopayPaymentState>

export default defineEventHandler(async (event) => {
  const paymentId = getRouterParam(event, "id") ?? ""
  const { action } = await readValidBody(
    event,
    DecisionSchema,
    createError({ status: 400, statusText: "action must be pay or cancel" }),
  )

  const payment = recordMockPaymentState(paymentId, MOCK_DECISION_STATES[action])
  if (payment === undefined) {
    throw createError({ status: 404, statusText: "Payment not found" })
  }

  await notifySite(event, payment)
  return sendRedirect(event, onRequestOrigin(event, payment.returnUrl), 303)
})

// Both callback URLs are absolute and built from the site config, which in
// development is the deployed site. The mock must not reach it: it answers
// on this server, so it calls back to this server.
function onRequestOrigin(event: RequestEvent, absoluteUrl: string): string {
  const target = new URL(absoluteUrl)
  return new URL(`${target.pathname}${target.search}`, getRequestURL(event).origin).href
}

async function notifySite(event: RequestEvent, payment: MockPayment): Promise<void> {
  const notification = new URL(onRequestOrigin(event, payment.notificationUrl))
  notification.searchParams.set("id", payment.id)
  const answer = await fetch(notification).catch((error: unknown) => error)
  if (answer instanceof Response && answer.ok) {
    return
  }
  // GoPay would keep retrying; the mock only says so once. The payer is
  // redirected either way, exactly as they would be at the real gateway.
  console.warn(`[gopay-mock] notification ${notification.href} was not answered 200`, answer)
}
