import { readItems } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import { OrderSchema } from "../../../directus/shared/utils/schemas"
import type { Order } from "../../../directus/shared/utils/schemas"
import { settlementStateForOrder } from "../../shared/utils/settlement"
import type { SettlementView } from "../../shared/utils/settlement"

// What the Student sees when GoPay sends them back. The Order is read with
// their own session, so Directus is the one place that decides it is theirs
// (ADR 0004) — another Student's Order simply is not there, and answers the
// same 404 as an id that never existed.

const ReturnCourseSchema = z.object({ title: z.string(), slug: z.string() })

async function readOwnOrder(client: DirectusRestClient, orderId: number): Promise<Order> {
  const rows = await client.request(
    readItems("order", { fields: [...ORDER_FIELDS], filter: { id: { _eq: orderId } }, limit: 1 }),
  )
  const row = rows[0]
  if (row === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" })
  }
  return OrderSchema.parse(row)
}

async function readOrderCourse(
  client: DirectusRestClient,
  courseId: number,
): Promise<z.output<typeof ReturnCourseSchema>> {
  const rows = await client.request(
    readItems("course", { fields: ["title", "slug"], filter: { id: { _eq: courseId } }, limit: 1 }),
  )
  const row = rows[0]
  if (row === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" })
  }
  return ReturnCourseSchema.parse(row)
}

// The Student usually arrives before GoPay's notification does, so the page
// settles too — the same function, so the outcome cannot differ. An inquiry
// that fails is not the Student's problem: they are shown the Order as it
// stands, which is the pending state, and GoPay's own notification (retried
// up to twenty times) settles it behind them.
async function settledStatus(event: H3Event, order: Order): Promise<Order["status"]> {
  if (order.gopay_payment_id === undefined) {
    return order.status
  }
  const settled = await settlePayment(event, order.gopay_payment_id).catch((error: unknown) => {
    console.warn(`[shop] Could not settle order ${order.id} from the return page`, error)
    return undefined
  })
  return settled?.order.status ?? order.status
}

export async function loadSettlementView(event: H3Event, orderId: number): Promise<SettlementView> {
  const { client } = await requireAccountDirectusClient(event)
  const order = await readOwnOrder(client, orderId)
  const status = await settledStatus(event, order)
  const course = await readOrderCourse(client, order.course)

  return {
    state: settlementStateForOrder(status),
    courseTitle: course.title,
    courseSlug: course.slug,
  }
}
