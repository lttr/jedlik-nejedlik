// Czech goes in `message` — the browser shows it. `statusMessage` becomes the
// HTTP reason phrase, which must stay ASCII.
export function authError(statusCode: number, code: string, message: string): Error {
  return createError({ statusCode, statusMessage: code, message })
}

// Something below the auth boundary broke in a way a Student cannot act on:
// log the cause for us, show them one generic sentence.
export function unexpectedAuthError(context: string, cause: unknown): Error {
  console.error(`[auth] ${context}`, cause)
  return authError(502, "auth_unavailable", authMessages.unavailable)
}
