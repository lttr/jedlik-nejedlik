import type { SettlementView } from "../../../../shared/utils/settlement"

// What the return page needs to render itself: the outcome of this Order,
// settled on the way. 401 has no session, 404 is not this Student's Order.
export default defineEventHandler(async (event): Promise<SettlementView> => {
  enforceRateLimit(event, SETTLEMENT_RATE_LIMIT)

  const orderId = Number(getRouterParam(event, "id"))
  if (!Number.isInteger(orderId)) {
    throw notFound()
  }
  return loadSettlementView(event, orderId)
})
