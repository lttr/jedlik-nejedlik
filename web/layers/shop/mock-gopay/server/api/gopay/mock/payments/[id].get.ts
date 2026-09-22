// This layer is in the build only in mock mode, so Nuxt generates no
// auto-imports for it elsewhere: everything it uses, it imports.
import { createError, defineEventHandler, getRouterParam } from "h3"

import { readMockPayment } from "../../../../../../server/utils/gopay-mock-client"
import type { MockPayment } from "../../../../../../server/utils/gopay-mock-client"

export default defineEventHandler((event): MockPayment => {
  const payment = readMockPayment(getRouterParam(event, "id") ?? "")
  if (payment === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Payment not found" })
  }
  return payment
})
