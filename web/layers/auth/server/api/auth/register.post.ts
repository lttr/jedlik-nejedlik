export default defineEventHandler(async (event) => {
  enforceRateLimit(event, REGISTER_RATE_LIMIT)
  await registerStudent(event, await readRegistration(event))
  sendNoContent(event)
})
