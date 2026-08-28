export default defineEventHandler(async (event) => {
  enforceRateLimit(event, VERIFY_EMAIL_RATE_LIMIT)
  await verifyStudentEmail(event, await readVerificationToken(event))
  sendNoContent(event)
})
