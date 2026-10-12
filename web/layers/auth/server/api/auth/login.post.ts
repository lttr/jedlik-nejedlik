import { defineEventHandler } from "nuxt/server"

import type { Account } from "#layers/auth/shared/types/account"
import { logInAccount, readCredentials } from "#layers/auth/server/utils/account-session"
import { LOGIN_RATE_LIMIT, enforceRateLimit } from "#layers/auth/server/utils/rate-limit"

export default defineEventHandler(async (event): Promise<Account> => {
  enforceRateLimit(event, LOGIN_RATE_LIMIT)
  // The sealed cookie carries the session to later requests; the Account in
  // the answer updates the page that logged in.
  return logInAccount(event, await readCredentials(event))
})
