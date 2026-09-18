import { createItem, readItems, readMe, updateItem, updateMe } from "@directus/sdk"
import type { H3Event } from "h3"

import { CourseSchema, OrderSchema } from "../../../directus/shared/utils/schemas"
import type { Order } from "../../../directus/shared/utils/schemas"
import {
  BILLING_FIELDS,
  checkoutConsents,
  reusableOrder,
  toBillingDetails,
  toBillingPayload,
} from "../../shared/utils/checkout"
import type { BillingDetails, SellableCourse } from "../../shared/utils/checkout"
import { assertCallbackUrl, isPaymentLive } from "../../shared/utils/gopay"

// Everything the Checkout does to Directus and to GoPay, so the two routes
// above it stay the three lines the house style asks for. Reads and the Order
// write go through the Student's own session, which is what makes Directus the
// one place that decides what they may see and place (ADR 0004); only the
// Payment id is stamped by the Service Account, because a Student may not
// write it (ADR 0006).

// Generous: placing an order is a deliberate act, and a Student who abandons
// the gateway and comes back a few times must not be locked out of buying.
export const CHECKOUT_RATE_LIMIT: RateLimit = {
  bucket: "checkout",
  max: 30,
  message: shopMessages.tooManyCheckouts,
}

// Exactly the `order` columns the Student policy lets them read, because
// `OrderSchema` insists on all of them. The Service Account may read all of
// them too, so the settlement selects the same list.
export const ORDER_FIELDS = [
  "id",
  "student",
  "course",
  "status",
  "price_czk",
  "gopay_payment_id",
  "fakturoid_invoice_id",
] as const

// A Course a Student may actually buy. Absent is 404 — the same 404 as a slug
// that never existed, so a draft stays invisible (ADR 0004) — and a Course
// without a price is refused rather than given away (spec, user story 24).
export async function loadCheckoutCourse(
  client: DirectusRestClient,
  slug: string,
): Promise<SellableCourse> {
  const rows = await client.request(
    readItems("course", {
      fields: [...COURSE_PUBLIC_FIELDS],
      filter: { status: { _in: SHOP_COURSE_STATUSES }, slug: { _eq: slug } },
      limit: 1,
    }),
  )
  const row = rows[0]
  if (row === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" })
  }
  const course = CourseSchema.parse(row)
  if (course.price_czk === undefined) {
    throw shopError(409, "course_not_for_sale", shopMessages.notForSale)
  }
  return { ...course, price_czk: course.price_czk }
}

// A Course already owned is never shown the form: buying it twice would take
// money for nothing. The read is the Student's own, so it can only ever find
// their own Entitlements.
export async function assertNotEntitled(
  client: DirectusRestClient,
  courseId: number,
): Promise<void> {
  const held = await client.request(
    readItems("entitlement", { fields: ["id"], filter: { course: { _eq: courseId } }, limit: 1 }),
  )
  if (held.length > 0) {
    throw shopError(409, "already_entitled", shopMessages.alreadyEntitled)
  }
}

export async function readAccountBilling(client: DirectusRestClient): Promise<BillingDetails> {
  const me = await client.request(readMe({ fields: [...BILLING_FIELDS] }))
  return toBillingDetails(me)
}

// The Student's own `created` Orders for this Course, newest first. Ten is
// plenty: `reusableOrder` only ever wants the newest of them.
async function readCreatedOrders(client: DirectusRestClient, courseId: number): Promise<Order[]> {
  const rows = await client.request(
    readItems("order", {
      fields: [...ORDER_FIELDS],
      filter: { course: { _eq: courseId }, status: { _eq: "created" } },
      sort: ["-id"],
      limit: 10,
    }),
  )
  return rows.map((row) => OrderSchema.parse(row))
}

// A Student who walked away from the gateway and came back gets the same
// Payment rather than a second Order (spec, user story 14). GoPay decides:
// only it knows whether the Payment is still payable. An inquiry that fails
// is treated as „no reusable Payment" — a fresh Order is always safe, a
// gateway URL we could not confirm is not.
async function liveGatewayUrl(
  event: H3Event,
  client: DirectusRestClient,
  courseId: number,
): Promise<string | undefined> {
  const candidate = reusableOrder(await readCreatedOrders(client, courseId))
  const paymentId = candidate?.gopay_payment_id
  if (paymentId === undefined) {
    return undefined
  }
  const payment = await getGopayClient(event)
    .inquirePayment(paymentId)
    .catch((error: unknown) => {
      console.warn(`[shop] Could not inquire GoPay payment ${paymentId}`, error)
      return undefined
    })
  return payment !== undefined && isPaymentLive(payment.state) ? payment.gwUrl : undefined
}

// The Order and its Consent in one write, by the Student's own session: the
// `student` column is the policy's preset and its validation, so an Order can
// only ever be placed for oneself. `price_czk` is the snapshot for the
// invoice; what GoPay charges is re-read from the Course below.
async function createOrder(
  client: DirectusRestClient,
  course: SellableCourse,
  billing: BillingDetails,
): Promise<number> {
  const created = await client.request(
    createItem(
      "order",
      {
        course: course.id,
        price_czk: course.price_czk,
        consents: checkoutConsents(),
        ...toBillingPayload(billing),
      },
      { fields: ["id"] },
    ),
  )
  return created.id
}

// The Payment, and the one write the Student is not allowed to make. The
// amount comes from the Course row this request just read, never from the
// browser (spec, user story 27). Both callbacks are absolute and built from
// the site config, so a forged Host header cannot steer where GoPay reports.
async function startPayment(
  event: H3Event,
  orderId: number,
  course: SellableCourse,
  payerEmail: string,
): Promise<string> {
  const returnUrl = authPageUrl(event, `/objednavka/${orderId}/navrat`)
  const notificationUrl = authPageUrl(event, "/api/gopay/notify")
  assertCallbackUrl("return_url", returnUrl)
  assertCallbackUrl("notification_url", notificationUrl)

  const payment = await getGopayClient(event).createPayment({
    orderId,
    priceCzk: course.price_czk,
    courseTitle: course.title,
    payerEmail,
    returnUrl,
    notificationUrl,
  })

  // The id is the settlement's idempotency key, so it has to be on the Order
  // before the Student can reach the gateway.
  await getShopServiceDirectusClient(event).request(
    updateItem("order", orderId, { gopay_payment_id: payment.id }),
  )
  return payment.gwUrl
}

export interface PlaceOrderInput {
  client: DirectusRestClient
  course: SellableCourse
  billing: BillingDetails
  email: string
}

// „Objednávka zavazující k platbě": the Billing Details land on the Account,
// the Order and its Consent are placed, the Payment is created, and the
// gateway URL comes back for the browser to follow.
export async function placeCheckoutOrder(
  event: H3Event,
  { client, course, billing, email }: PlaceOrderInput,
): Promise<string> {
  const live = await liveGatewayUrl(event, client, course.id)
  if (live !== undefined) {
    return live
  }

  try {
    // Remembered for next time (spec, user story 7). The Order keeps its own
    // snapshot, so a later correction here never alters an issued invoice.
    await client.request(updateMe(toBillingPayload(billing), { fields: ["id"] }))
    const orderId = await createOrder(client, course, billing)
    return await startPayment(event, orderId, course, email)
  } catch (error) {
    throw unexpectedShopError(
      `Checkout of course ${course.slug} failed`,
      error,
      shopMessages.checkoutUnavailable,
    )
  }
}
