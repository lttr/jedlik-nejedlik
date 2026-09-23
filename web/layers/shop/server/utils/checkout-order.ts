import { createItem, readItems, updateItem, updateMe } from "@directus/sdk"
import type { H3Event } from "h3"

import { CourseSchema, OrderSchema } from "#layers/directus/shared/utils/schemas"
import type { Order } from "#layers/directus/shared/utils/schemas"
import {
  checkoutConsents,
  reusableOrder,
  toBillingPayload,
} from "#layers/shop/shared/utils/checkout"
import type { BillingDetails, SellableCourse } from "#layers/shop/shared/utils/checkout"
import { isPaymentLive } from "#layers/shop/shared/utils/gopay"
import { COURSE_PUBLIC_FIELDS, readCourseBySlug } from "./course-query"
import { holdsEntitlement } from "./entitlements"
import { getGopayClient } from "./gopay-client"
import { shopError, shopMessages, unexpectedShopError } from "./shop-errors"
import { getShopServiceDirectusClient } from "./shop-service-client"
import { authPageUrl } from "#layers/auth/server/utils/auth-urls"
import type { RateLimit } from "#layers/auth/server/utils/rate-limit"
import type { DirectusRestClient } from "#layers/directus/shared/utils/directus"

// Everything the Checkout writes to Directus and to GoPay: the Student's own
// session, except the Payment id stamped by the Shop Service Account (ADR
// 0006). See docs/shop.md, „Checkout". "spec" below is
// `.aiwork/2026-09-15_checkout-gopay/spec.md`.

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

// A Course a Student may actually buy: absent is the shop's 404 (ADR 0004),
// and a Course without a price is refused rather than given away (spec, user
// story 24).
export async function loadCheckoutCourse(
  client: DirectusRestClient,
  slug: string,
): Promise<SellableCourse> {
  const course = CourseSchema.parse(await readCourseBySlug(client, slug, [...COURSE_PUBLIC_FIELDS]))
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
  if (await holdsEntitlement(client, courseId)) {
    throw shopError(409, "already_entitled", shopMessages.alreadyEntitled)
  }
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

// A Student who came back from the gateway gets the same Payment rather than a
// second Order (spec, user story 14). An inquiry that fails counts as „no
// reusable Payment": a fresh Order is always safe.
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
  // `""` is as bad as `undefined`: GoPay can answer an inquiry without a
  // `gw_url`, and handing that to the browser is a buy button that goes
  // nowhere.
  if (payment === undefined || !isPaymentLive(payment.state) || payment.gwUrl === "") {
    return undefined
  }
  return payment.gwUrl
}

// The `student` column is the policy's preset and its validation, so an Order
// can only ever be placed for oneself. `price_czk` is the snapshot for the
// invoice.
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

// The amount comes from the Course row, never from the browser (spec, user
// story 27). Both callbacks are absolute and built from the site config, so a
// forged Host header cannot steer where GoPay reports.
async function startPayment(
  event: H3Event,
  orderId: number,
  course: SellableCourse,
  payerEmail: string,
): Promise<string> {
  // The cap on both callbacks is GoPay's, so it is the client that checks
  // them — once, for every caller, and where the unit suite can see it.
  const returnUrl = authPageUrl(event, `/objednavka/${orderId}/navrat`)
  const notificationUrl = authPageUrl(event, "/api/gopay/notify")

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

  // Stamped first, refused second: a Payment GoPay created but gave us no page
  // for can still be settled, so the Order has to carry its id first.
  if (payment.gwUrl === "") {
    throw new Error(`GoPay created payment ${payment.id} without a gateway URL`)
  }
  return payment.gwUrl
}

export interface PlaceOrderInput {
  client: DirectusRestClient
  course: SellableCourse
  billing: BillingDetails
  email: string
}

export async function placeCheckoutOrder(
  event: H3Event,
  { client, course, billing, email }: PlaceOrderInput,
): Promise<string> {
  try {
    const live = await liveGatewayUrl(event, client, course.id)
    if (live !== undefined) {
      return live
    }

    // Remembered for next time (spec, user story 7). Neither write needs the
    // other — the Order keeps its own snapshot — so the Student waits for one
    // round-trip rather than two.
    const [, orderId] = await Promise.all([
      client.request(updateMe(toBillingPayload(billing), { fields: ["id"] })),
      createOrder(client, course, billing),
    ])
    return await startPayment(event, orderId, course, email)
  } catch (error) {
    throw unexpectedShopError(
      `Checkout of course ${course.slug} failed`,
      error,
      shopMessages.checkoutUnavailable,
    )
  }
}
