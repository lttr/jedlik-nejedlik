// This layer is in the build only in mock mode, so Nuxt's auto-imports are
// not generated for it on a machine that talks to the real GoPay. Everything
// it uses it imports, and the file stays readable to the linter either way.
import { createError, defineEventHandler, getRouterParam } from "h3"

import { readMockPayment } from "../../../../../../server/utils/gopay-mock-client"
import type { MockPayment } from "../../../../../../server/utils/gopay-mock-client"

// What the mock gateway page shows: the Payment as the mock recorded it.
export default defineEventHandler((event): MockPayment => {
  const payment = readMockPayment(getRouterParam(event, "id") ?? "")
  if (payment === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Payment not found" })
  }
  return payment
})
