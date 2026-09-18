import { updateMe } from "@directus/sdk"

import { BillingRequestSchema, toBillingPayload } from "../../../shared/utils/checkout"

// „Fakturační údaje" saved outside a purchase (spec, user story 21). The
// write goes through the caller's own session and `/users/me`, so the six
// columns can only ever land on their own row — the Student policy's update
// rule is scoped to `$CURRENT_USER` and lists exactly these fields plus the
// password. No row id is ever taken from the browser.
//
// Orders keep their own snapshot, so correcting an Account here never alters
// an invoice already issued (spec, user story 22).
export default defineEventHandler(async (event): Promise<void> => {
  enforceRateLimit(event, BILLING_RATE_LIMIT)

  const { client } = await requireAccountDirectusClient(event)

  const request = BillingRequestSchema.safeParse(await readBody(event).catch(() => undefined))
  if (!request.success) {
    throw shopError(400, "invalid_billing", shopMessages.billingInvalid)
  }

  try {
    await client.request(updateMe(toBillingPayload(request.data), { fields: ["id"] }))
  } catch (error) {
    throw unexpectedShopError("Saving billing details failed", error, shopMessages.billingUnsaved)
  }

  sendNoContent(event)
})
