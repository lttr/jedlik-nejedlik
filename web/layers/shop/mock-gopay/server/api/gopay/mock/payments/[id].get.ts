import { createError, defineEventHandler, getRouterParam } from "nuxt/server"

import { readMockPayment } from "#layers/shop/server/utils/gopay-mock-client"
import type { MockPayment } from "#layers/shop/server/utils/gopay-mock-client"

export default defineEventHandler((event): MockPayment => {
  const payment = readMockPayment(getRouterParam(event, "id") ?? "")
  if (payment === undefined) {
    throw createError({ status: 404, statusText: "Payment not found" })
  }
  return payment
})
