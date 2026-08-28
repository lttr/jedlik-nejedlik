export default defineEventHandler(async (event) => {
  enforceRateLimit(event, LOGIN_RATE_LIMIT)
  await logInStudent(event, await readCredentials(event))
  // The sealed cookie is the whole result; the browser reads the Student back
  // through `useStudent()`.
  sendNoContent(event)
})
