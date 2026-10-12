import { defineEventHandler } from "nuxt/server"

import { REGISTER_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { readRegistration, registerStudent } from "#layers/auth/server/utils/registration"
import { noContent } from "#layers/base/server/utils/no-content"

export default defineEventHandler(async (event): Promise<null> => {
  enforceRateLimit(event, REGISTER_RATE_LIMIT)
  await registerStudent(event, await readRegistration(event))
  return noContent(event)
})
