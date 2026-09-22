import { createItem, readItems, updateItem } from "@directus/sdk"
import type { H3Event } from "h3"

import { OrderSchema } from "../../../directus/shared/utils/schemas"
import type { Order } from "../../../directus/shared/utils/schemas"
import { orderStatusForPaymentState } from "../../shared/utils/gopay"
import type { GopayPaymentState } from "../../shared/utils/gopay"

// The one place where money turns into access (spec, „Settlement"). Both the
// public notification route and the Student's return page call this and
// nothing else, so there is a single answer to „is this Payment settled" and
// a single write path to get there.
//
// Every branch is idempotent by construction: the Order's status decides what
// is left to do, and the Entitlement's unique index on (student, course) is
// the last line of defence when two callers arrive at once.

// GoPay retries a non-200 answer up to twenty times and the Student's return
// page settles the same Payment again, so the budget only has to stop a flood
// from one address — not to ration honest traffic.
export const GOPAY_NOTIFY_RATE_LIMIT: RateLimit = {
  bucket: "gopay-notify",
  max: 120,
  message: shopMessages.tooManyNotifications,
}

// The Order a Payment belongs to. `gopay_payment_id` is unique, which is what
// makes it the idempotency key.
async function readOrderByPayment(
  client: DirectusRestClient,
  paymentId: string,
): Promise<Order | undefined> {
  const row = await readFirstRow(
    client,
    readItems("order", {
      fields: [...ORDER_FIELDS],
      filter: { gopay_payment_id: { _eq: paymentId } },
      limit: 1,
    }),
  )
  return row === undefined ? undefined : OrderSchema.parse(row)
}

async function grantEntitlement(client: DirectusRestClient, order: Order): Promise<void> {
  try {
    await client.request(
      createItem(
        "entitlement",
        { student: order.student, course: order.course, order: order.id },
        { fields: ["id"] },
      ),
    )
  } catch (error) {
    // Directus answers a duplicate row with this code; for the Entitlement it
    // means another caller already granted the Course, which is success.
    if (directusErrorCode(error) !== "RECORD_NOT_UNIQUE") {
      throw error
    }
    // Already granted — by an earlier notification, by the return page, or by
    // hand in the admin app. The Course is open either way, which is all this
    // step was for.
    console.warn(`[shop] Entitlement for order ${order.id} already existed`)
  }
}

async function applyPaymentState(
  client: DirectusRestClient,
  order: Order,
  state: GopayPaymentState,
): Promise<Order> {
  const target = orderStatusForPaymentState(state)
  if (target === undefined || target === order.status) {
    // Not an outcome yet (`CREATED`, `PAYMENT_METHOD_CHOSEN`), or an outcome
    // this Order already carries. Nothing is written, so a repeat is free.
    return order
  }
  if (target === "cancelled" && order.status === "paid") {
    // A paid Order is final for this area; a refund is made by hand in
    // GoPay's admin and does not take the Course away.
    return order
  }
  if (target === "paid") {
    // The § 1824a confirmation e-mail (spec, user story 34) belongs to the
    // legal-documents area (`.aiwork/2026-06-09_kurzy-platforma/areas.md`,
    // area 10) and goes here, before the grant and awaited: that way it runs
    // exactly once per Order, and a failure in it stops the settlement rather
    // than half-finishing it.
    await grantEntitlement(client, order)
  }
  // Last, so a crash anywhere above leaves the Order unsettled and the next
  // notification tries again.
  await client.request(updateItem("order", order.id, { status: target }))
  return { ...order, status: target }
}

export interface Settlement {
  order: Order
}

// `undefined` means no Order carries this Payment id: a forged notification,
// or one meant for another instance. The Order is looked up before GoPay is
// asked anything, so a forged id costs one Directus read and never reaches
// GoPay's API (spec, user story 32).
export async function settlePayment(
  event: H3Event,
  paymentId: string,
): Promise<Settlement | undefined> {
  const order = await readOrderByPayment(getShopServiceDirectusClient(event), paymentId)
  return order === undefined ? undefined : settleOrder(event, order)
}

// The same settlement for a caller that already holds the Order: the return
// page has just read it with the Student's own session, and looking it up
// again by Payment id would buy nothing.
export async function settleOrder(event: H3Event, order: Order): Promise<Settlement> {
  const paymentId = order.gopay_payment_id
  if (paymentId === undefined || order.status === "paid") {
    // Nothing to inquire about, or nothing an inquiry could change: for an
    // Order already `paid`, `applyPaymentState` discards every answer GoPay
    // can give (`paid` is a no-op, `cancelled` is refused for a paid Order).
    // GoPay sends more than one notification per Payment and retries a failed
    // one up to twenty times, so the call saved here is on the retry path.
    return { order }
  }

  // Never the notification's word for it: the state always comes from an
  // inquiry, so nothing a caller sends can fake a payment.
  const payment = await getGopayClient(event).inquirePayment(paymentId)
  const client = getShopServiceDirectusClient(event)
  return { order: await applyPaymentState(client, order, payment.state) }
}
