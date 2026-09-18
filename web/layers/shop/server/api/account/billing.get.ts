import type { BillingDetails } from "../../../shared/utils/checkout"

// „Fakturační údaje" on the Account page, pre-filled. The same read the
// Checkout does, on the caller's own session: the Student policy's read rule
// is scoped to `$CURRENT_USER`, so `/users/me` can only answer with their own
// row.
export default defineEventHandler(async (event): Promise<BillingDetails> => {
  const { client } = await requireAccountDirectusClient(event)
  return readAccountBilling(client)
})
