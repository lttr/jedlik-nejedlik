export default defineEventHandler(async (event) => {
  enforceRateLimit(event, PASSWORD_REQUEST_RATE_LIMIT)
  await requestPasswordReset(event, await readResetRequest(event))
  // The same 204 for an address with an account and one without: Directus does
  // not tell us which it was, on purpose.
  sendNoContent(event)
})
