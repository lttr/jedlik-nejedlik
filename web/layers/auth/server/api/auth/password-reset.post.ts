import { readPasswordReset, resetAccountPassword } from "#layers/auth/server/utils/password-reset"
import { PASSWORD_RESET_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_RESET_RATE_LIMIT)
  await resetAccountPassword(event, await readPasswordReset(event))
  sendNoContent(event)
})
