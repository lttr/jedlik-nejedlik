import { defineEventHandler } from "nuxt/server"

import { logOutAccount } from "#layers/auth/server/utils/account-session"
import { noContent } from "#layers/base/server/utils/no-content"

export default defineEventHandler(async (event): Promise<null> => {
  await logOutAccount(event)
  return noContent(event)
})
