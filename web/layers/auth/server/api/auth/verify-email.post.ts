import { defineEventHandler } from "nuxt/server"

import { VERIFY_EMAIL_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { readVerificationToken, verifyAccountEmail } from "#layers/auth/server/utils/registration"
import { noContent } from "#layers/base/server/utils/no-content"

export default defineEventHandler(async (event): Promise<null> => {
  enforceRateLimit(event, VERIFY_EMAIL_RATE_LIMIT)
  await verifyAccountEmail(event, await readVerificationToken(event))
  return noContent(event)
})
