export default defineEventHandler(async (event) => {
  enforceRateLimit(event, LOGIN_RATE_LIMIT)
  await logInAccount(event, await readCredentials(event))
  // The sealed cookie is the whole result; the browser re-reads the session.
  sendNoContent(event)
})
