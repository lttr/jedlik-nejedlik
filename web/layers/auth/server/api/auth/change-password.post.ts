import {
  changeAccountPassword,
  readPasswordChange,
} from "#layers/auth/server/utils/password-change"
import { CHANGE_PASSWORD_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, CHANGE_PASSWORD_RATE_LIMIT)
  await changeAccountPassword(event, await readPasswordChange(event))
  sendNoContent(event)
})
