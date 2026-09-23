import { VERIFY_EMAIL_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { readVerificationToken, verifyAccountEmail } from "#layers/auth/server/utils/registration"

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, VERIFY_EMAIL_RATE_LIMIT)
  await verifyAccountEmail(event, await readVerificationToken(event))
  sendNoContent(event)
})
