import type { BillingDetails } from "../../../shared/utils/checkout"

export default defineEventHandler(async (event): Promise<BillingDetails> => {
  const { client } = await requireAccountDirectusClient(event)
  return readAccountBilling(client)
})
