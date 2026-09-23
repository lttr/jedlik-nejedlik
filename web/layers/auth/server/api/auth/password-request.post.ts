import { readResetRequest, requestPasswordReset } from "#layers/auth/server/utils/password-reset"
import { PASSWORD_REQUEST_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_REQUEST_RATE_LIMIT)
  await requestPasswordReset(event, await readResetRequest(event))
  sendNoContent(event)
})
