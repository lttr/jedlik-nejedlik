export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_RESET_RATE_LIMIT)
  await resetStudentPassword(event, await readPasswordReset(event))
  // The Student is not logged in by this: the reset page sends them to the
  // login form, so the new password is exercised straight away.
  sendNoContent(event)
})
