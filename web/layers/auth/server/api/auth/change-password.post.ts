export default defineEventHandler(async (event) => {
  enforceRateLimit(event, CHANGE_PASSWORD_RATE_LIMIT)
  await changeAccountPassword(event, await readPasswordChange(event))
  sendNoContent(event)
})
