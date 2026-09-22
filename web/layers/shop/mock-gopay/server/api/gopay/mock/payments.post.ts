// Imports rather than auto-imports: see `payments/[id].get.ts`.
import { createError, defineEventHandler, readBody } from "h3"
import { z } from "zod"

import { getGopayClient } from "../../../../../server/utils/gopay-client"
import type { GopayPayment } from "../../../../../shared/utils/gopay"

// Creates a Payment the way the Checkout would, through the same
// `getGopayClient(event)` seam, so the gateway can be walked without an Order.
const DemoPaymentSchema = z.object({
  orderId: z.number().int().default(0),
  priceCzk: z.number().int().nonnegative(),
  courseTitle: z.string().default("Testovací kurz"),
  payerEmail: z.email().default("student@example.com"),
  returnUrl: z.url(),
  notificationUrl: z.url(),
})

export default defineEventHandler(async (event): Promise<GopayPayment> => {
  const input = DemoPaymentSchema.safeParse(await readBody(event))
  if (!input.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payment",
      message: z.prettifyError(input.error),
    })
  }
  return getGopayClient(event).createPayment(input.data)
})
