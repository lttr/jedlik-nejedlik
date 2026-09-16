// Imports rather than auto-imports: see the sibling `[id].get.ts`.
import {
  createError,
  defineEventHandler,
  getRequestURL,
  getRouterParam,
  readBody,
  sendRedirect,
} from "h3"
import type { H3Event } from "h3"
import { z } from "zod"

import { recordMockPaymentState } from "../../../../../../../server/utils/gopay-mock-client"
import type { MockPayment } from "../../../../../../../server/utils/gopay-mock-client"

// „Zaplatit" and „Zrušit" — the only two things a payer can do at this
// gateway. The page posts a plain form here, and so can any HTTP client
// (`{"action":"pay"}` as JSON works just as well), which is how a flow test
// pays without a browser.
//
// The order of what happens is GoPay's: record the state, notify the site
// server-to-server, then send the payer back. The notification is awaited,
// so by the time the redirect is answered the site has already settled the
// Order — a flow test can assert straight after this call returns.
const DecisionSchema = z.object({ action: z.enum(["pay", "cancel"]) })

export default defineEventHandler(async (event) => {
  const paymentId = getRouterParam(event, "id") ?? ""
  const decision = DecisionSchema.safeParse(await readBody(event))
  if (!decision.success) {
    throw createError({ statusCode: 400, statusMessage: "action must be pay or cancel" })
  }

  const payment = recordMockPaymentState(
    paymentId,
    decision.data.action === "pay" ? "PAID" : "CANCELED",
  )
  if (payment === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Payment not found" })
  }

  await notifySite(event, payment)
  return sendRedirect(event, onRequestOrigin(event, payment.returnUrl), 303)
})

// Both callback URLs are absolute and built from the site config, which in
// development is the deployed site. The mock must not reach it: it answers
// on this server, so it calls back to this server.
function onRequestOrigin(event: H3Event, absoluteUrl: string): string {
  const target = new URL(absoluteUrl)
  return new URL(`${target.pathname}${target.search}`, getRequestURL(event).origin).href
}

async function notifySite(event: H3Event, payment: MockPayment): Promise<void> {
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
