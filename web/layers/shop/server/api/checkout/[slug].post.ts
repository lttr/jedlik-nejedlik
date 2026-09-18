import { z } from "zod"

import { BillingRequestSchema } from "../../../shared/utils/checkout"

// „Objednávka zavazující k platbě". The answer is the gateway URL the browser
// is sent to; everything else the press does — the Billing Details on the
// Account, the Order, its Consent, the Payment — happens on the way there.
//
// The body carries no price: the amount is re-read from the Course, so a
// tampered request buys nothing cheaper (spec, user story 27). Anything else
// the browser sends is stripped by the schema.
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
    // Two things a Student can get wrong, and each has to be told apart: the
    // checkbox, and a Billing Detail longer than the column takes. „Tick the
    // box" over a box they already ticked is a refusal they cannot act on.
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
