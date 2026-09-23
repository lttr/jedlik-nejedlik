import { REGISTER_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"
import { readRegistration, registerStudent } from "#layers/auth/server/utils/registration"

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, REGISTER_RATE_LIMIT)
  await registerStudent(event, await readRegistration(event))
  sendNoContent(event)
})
