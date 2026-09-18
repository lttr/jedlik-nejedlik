import { readMe } from "@directus/sdk"

import { BILLING_FIELDS, toBillingDetails } from "../../shared/utils/checkout"
import type { BillingDetails } from "../../shared/utils/checkout"

// The Billing Details as they sit on the Account, read by both places that
// pre-fill the form: step 2 of the Checkout and „Fakturační údaje" on the
// Account page. Always `/users/me` on the caller's own session, so there is
// no user id in shop code at all.
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
