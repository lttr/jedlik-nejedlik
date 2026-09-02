export default defineEventHandler(async (event) => {
  enforceRateLimit(event, CHANGE_PASSWORD_RATE_LIMIT)
  await changeStudentPassword(event, await readPasswordChange(event))
  sendNoContent(event)
})
