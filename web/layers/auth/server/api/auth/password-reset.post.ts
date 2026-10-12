import { defineEventHandler } from "nuxt/server"

import { readPasswordReset, resetAccountPassword } from "#layers/auth/server/utils/password-reset"
import { PASSWORD_RESET_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { noContent } from "#layers/base/server/utils/no-content"

export default defineEventHandler(async (event): Promise<null> => {
  enforceRateLimit(event, PASSWORD_RESET_RATE_LIMIT)
  await resetAccountPassword(event, await readPasswordReset(event))
  return noContent(event)
})
