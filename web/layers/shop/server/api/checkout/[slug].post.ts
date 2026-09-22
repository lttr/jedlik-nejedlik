import { z } from "zod"

import { BillingRequestSchema } from "../../../shared/utils/checkout"

// The body carries no price: the amount is re-read from the Course, so a
// tampered request buys nothing cheaper (spec, user story 27).
// See docs/shop.md, „Checkout".
const CheckoutRequestSchema = z.object({
  consent: z.literal(true),
  billing: BillingRequestSchema,
})

export default defineEventHandler(async (event): Promise<{ gwUrl: string }> => {
  enforceRateLimit(event, CHECKOUT_RATE_LIMIT)

  const slug = getRouterParam(event, "slug") ?? ""
  const { account, client } = await requireAccountDirectusClient(event)

  const request = CheckoutRequestSchema.safeParse(await readBody(event).catch(() => undefined))
  if (!request.success) {
    // Told apart on purpose: „Tick the box" over a box the Student already
    // ticked is a refusal they cannot act on.
    const billingAtFault = request.error.issues.some((issue) => issue.path[0] === "billing")
    throw billingAtFault
      ? shopError(400, "invalid_billing", shopMessages.billingInvalid)
      : shopError(400, "consent_required", shopMessages.consentRequired)
  }

  const course = await loadCheckoutCourse(client, slug)
  await assertNotEntitled(client, course.id)

  const gwUrl = await placeCheckoutOrder(event, {
    client,
    course,
    billing: request.data.billing,
    email: account.email,
  })
  return { gwUrl }
})
