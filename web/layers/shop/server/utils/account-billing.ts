import { readMe } from "@directus/sdk"

import { BILLING_FIELDS, toBillingDetails } from "#layers/shop/shared/utils/checkout"
import type { BillingDetails } from "#layers/shop/shared/utils/checkout"
import { shopMessages } from "./shop-errors"
import type { RateLimit } from "#layers/auth/server/utils/rate-limit"
import type { DirectusRestClient } from "#layers/directus/shared/utils/directus"

// Always `/users/me` on the caller's own session, so no user id appears in
// shop code at all.
export async function readAccountBilling(client: DirectusRestClient): Promise<BillingDetails> {
  const me = await client.request(readMe({ fields: [...BILLING_FIELDS] }))
  return toBillingDetails(me)
}

// Correcting an invoice detail is cheap and people do it in bursts of typos;
// this is a guard against a script, not against a Student.
export const BILLING_RATE_LIMIT: RateLimit = {
  bucket: "billing",
  max: 30,
  message: shopMessages.tooManyBillingSaves,
}
