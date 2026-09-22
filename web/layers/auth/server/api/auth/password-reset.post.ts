export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_RESET_RATE_LIMIT)
  await resetAccountPassword(event, await readPasswordReset(event))
  sendNoContent(event)
})
