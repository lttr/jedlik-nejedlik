import { logOutAccount } from "#layers/auth/server/utils/account-session"

export default defineEventHandler(async (event) => {
  await logOutAccount(event)
  sendNoContent(event)
})
