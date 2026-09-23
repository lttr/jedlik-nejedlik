import type { BillingDetails } from "#layers/shop/shared/utils/checkout"
import { requireAccountDirectusClient } from "#layers/auth/server/utils/account-session"
import { readAccountBilling } from "#layers/shop/server/utils/account-billing"

export default defineEventHandler(async (event): Promise<BillingDetails> => {
  const { client } = await requireAccountDirectusClient(event)
  return readAccountBilling(client)
})
