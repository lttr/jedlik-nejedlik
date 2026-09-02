export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_RESET_RATE_LIMIT)
  await resetStudentPassword(event, await readPasswordReset(event))
  // Does not log in: the page sends the Student to the login form instead.
  sendNoContent(event)
})
