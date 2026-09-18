import * as Sentry from "@sentry/nuxt"
import { z } from "zod"

// GoPay's server-to-server notification: a bare GET carrying only the Payment
// id (spec, „Further Notes"). Nothing in it is trusted — the id is a lookup
// key and the state always comes from an inquiry — so the route is public,
// with no IP allow-list and a per-IP budget instead (spec, user story 32).
const NotificationSchema = z.object({ id: z.string().min(1).max(64) })

export default defineEventHandler(async (event): Promise<{ status: string }> => {
  enforceRateLimit(event, GOPAY_NOTIFY_RATE_LIMIT)

  const notification = NotificationSchema.safeParse(getQuery(event))
  if (!notification.success) {
    console.warn("[shop] GoPay notification without a payment id")
    return { status: "ignored" }
  }
  const paymentId = notification.data.id

  try {
    const settled = await settlePayment(event, paymentId)
    if (settled === undefined) {
      // No Order carries this Payment: a forged call, or one meant for another
      // instance. 200, because a retry would never find it either.
      console.warn(`[shop] GoPay notification for unknown payment ${paymentId}`)
      return { status: "unknown" }
    }
    return { status: settled.order.status }
  } catch (error) {
    // Money may have been taken without the Course being opened, which is the
    // one failure that has to be noticed within minutes (spec, user story 31).
    // The 500 is deliberate: it is what makes GoPay retry.
    Sentry.captureException(error, { tags: { gopayPaymentId: paymentId } })
    console.error(`[shop] Settling GoPay payment ${paymentId} failed`, error)
    throw createError({ statusCode: 500, statusMessage: "Settlement failed" })
  }
})
