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

// The return page polls this every three seconds for half a minute, and every
// poll that finds an unsettled Order asks GoPay about the Payment. Generous
// enough for several purchases from one household, tight enough that a
// logged-in caller cannot use the page as a loop through GoPay's API.
export const SETTLEMENT_RATE_LIMIT: RateLimit = {
  bucket: "settlement",
  max: 120,
  message: shopMessages.tooManySettlementChecks,
}

const ReturnCourseSchema = z.object({ title: z.string(), slug: z.string() })

async function readOwnOrder(client: DirectusRestClient, orderId: number): Promise<Order> {
  return OrderSchema.parse(
    await readOnlyRow(
      client,
      readItems("order", { fields: [...ORDER_FIELDS], filter: { id: { _eq: orderId } }, limit: 1 }),
    ),
  )
}

// `readFirstRow`, not `readOnlyRow`: a Course turned back into a draft or
// archived after the Order was placed is no longer readable to the Student,
// and Directus answers that with no row. The outcome of a Payment must never
// hang on the Catalog — a Student who has just paid has to be told so, even
// when the page can no longer name what they bought.
async function readOrderCourse(
  client: DirectusRestClient,
  courseId: number,
): Promise<z.output<typeof ReturnCourseSchema> | undefined> {
  const row = await readFirstRow(
    client,
    readItems("course", {
      fields: ["title", "slug"],
      filter: { id: { _eq: courseId } },
      limit: 1,
    }),
  )
  return row === undefined ? undefined : ReturnCourseSchema.parse(row)
}

// The Student usually arrives before GoPay's notification does, so the page
// settles too — the same function, so the outcome cannot differ. An inquiry
// that fails is not the Student's problem: they are shown the Order as it
// stands, which is the pending state, and GoPay's own notification (retried
// up to twenty times) settles it behind them.
async function settledStatus(event: H3Event, order: Order): Promise<Order["status"]> {
  const settled = await settleOrder(event, order).catch((error: unknown) => {
    console.warn(`[shop] Could not settle order ${order.id} from the return page`, error)
    return undefined
  })
  return settled?.order.status ?? order.status
}

export async function loadSettlementView(event: H3Event, orderId: number): Promise<SettlementView> {
  const { client } = await requireAccountDirectusClient(event)
  const order = await readOwnOrder(client, orderId)
  // The Course only ever needs `order.course`, which the read above already
  // gave us, so it must not wait behind GoPay's inquiry: the page polls this
  // every three seconds until the Order settles.
  const [status, course] = await Promise.all([
    settledStatus(event, order),
    readOrderCourse(client, order.course),
  ])

  return {
    state: settlementStateForOrder(status),
    courseTitle: course?.title ?? "",
    courseSlug: course?.slug ?? "",
  }
}
