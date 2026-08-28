export default defineEventHandler(async (event) => {
  enforceRateLimit(event, CHANGE_PASSWORD_RATE_LIMIT)
  await changeStudentPassword(event, await readPasswordChange(event))
  // The re-sealed cookie is the whole result: the Student stays logged in
  // here and nowhere else.
  sendNoContent(event)
})
