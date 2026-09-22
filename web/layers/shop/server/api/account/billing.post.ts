import { updateMe } from "@directus/sdk"

import { BillingRequestSchema, toBillingPayload } from "../../../shared/utils/checkout"

// The write goes through the caller's own session and `/users/me`, so it can
// only ever land on their own row — no row id comes from the browser. Orders
// keep their own snapshot (spec, user story 22).
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
