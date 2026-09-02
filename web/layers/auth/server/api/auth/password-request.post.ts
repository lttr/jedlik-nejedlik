export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_REQUEST_RATE_LIMIT)
  await requestPasswordReset(event, await readResetRequest(event))
  sendNoContent(event)
})
