export default defineEventHandler(async (event) => {
  enforceRateLimit(event, REGISTER_RATE_LIMIT)
  await registerStudent(event, await readRegistration(event))
  // The same 204 for a fresh address and for one that already has an account:
  // Directus does not tell us which it was, on purpose.
  sendNoContent(event)
})
