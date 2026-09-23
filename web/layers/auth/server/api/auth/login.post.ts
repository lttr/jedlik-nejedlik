import { logInAccount, readCredentials } from "#layers/auth/server/utils/account-session"
import { LOGIN_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, LOGIN_RATE_LIMIT)
  await logInAccount(event, await readCredentials(event))
  // The sealed cookie is the whole result; the browser re-reads the session.
  sendNoContent(event)
})
