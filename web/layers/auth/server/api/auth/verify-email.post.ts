export default defineEventHandler(async (event) => {
  enforceRateLimit(event, VERIFY_EMAIL_RATE_LIMIT)
  await verifyAccountEmail(event, await readVerificationToken(event))
  sendNoContent(event)
})
