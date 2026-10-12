import { defineEventHandler } from "nuxt/server"

import {
  changeAccountPassword,
  readPasswordChange,
} from "#layers/auth/server/utils/password-change"
import { CHANGE_PASSWORD_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { noContent } from "#layers/base/server/utils/no-content"

export default defineEventHandler(async (event): Promise<null> => {
  enforceRateLimit(event, CHANGE_PASSWORD_RATE_LIMIT)
  await changeAccountPassword(event, await readPasswordChange(event))
  return noContent(event)
})
