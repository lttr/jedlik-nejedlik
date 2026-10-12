import { defineEventHandler } from "nuxt/server"
import { updateMe } from "@directus/sdk"

import { BillingRequestSchema, toBillingPayload } from "#layers/shop/shared/utils/checkout"
import { requireAccountDirectusClient } from "#layers/auth/server/utils/account-session"
import { enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { BILLING_RATE_LIMIT } from "#layers/shop/server/utils/account-billing"
import { shopError, shopMessages, unexpectedShopError } from "#layers/shop/server/utils/shop-errors"
import { noContent } from "#layers/base/server/utils/no-content"
import { readValidBody } from "#layers/base/server/utils/valid-body"

// The write goes through the caller's own session and `/users/me`, so it can
// only ever land on their own row — no row id comes from the browser. Orders
// keep their own snapshot (spec, user story 22).
export default defineEventHandler(async (event): Promise<null> => {
  enforceRateLimit(event, BILLING_RATE_LIMIT)

  const { client } = await requireAccountDirectusClient(event)

  const billing = await readValidBody(
    event,
    BillingRequestSchema,
    shopError(400, "invalid_billing", shopMessages.billingInvalid),
  )

  try {
    await client.request(updateMe(toBillingPayload(billing), { fields: ["id"] }))
  } catch (error) {
    throw unexpectedShopError("Saving billing details failed", error, shopMessages.billingUnsaved)
  }

  return noContent(event)
})
