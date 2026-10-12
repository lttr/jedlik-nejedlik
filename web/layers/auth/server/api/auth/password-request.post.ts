import { defineEventHandler } from "nuxt/server"

import { readResetRequest, requestPasswordReset } from "#layers/auth/server/utils/password-reset"
import { PASSWORD_REQUEST_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { noContent } from "#layers/base/server/utils/no-content"

export default defineEventHandler(async (event): Promise<null> => {
  enforceRateLimit(event, PASSWORD_REQUEST_RATE_LIMIT)
  await requestPasswordReset(event, await readResetRequest(event))
  return noContent(event)
})
