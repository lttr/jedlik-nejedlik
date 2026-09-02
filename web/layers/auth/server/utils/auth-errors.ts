import { z } from "zod"

// `message` carries the Czech text the browser shows; `statusMessage` becomes
// the HTTP reason phrase and must stay ASCII.
export function authError(statusCode: number, code: string, message: string): Error {
  return createError({ statusCode, statusMessage: code, message })
}

// A transport failure (instance down, DNS, TLS) has no `errors` at all, so
// `undefined` means "Directus never answered", never "Directus said no".
const DirectusErrors = z.object({
  errors: z.array(z.object({ extensions: z.object({ code: z.string() }) })).min(1),
})

export function directusErrorCode(error: unknown): string | undefined {
  const parsed = DirectusErrors.safeParse(error)
  return parsed.success ? parsed.data.errors[0]?.extensions.code : undefined
}

// Log the cause for us; show the Student one generic sentence.
export function unexpectedAuthError(
  context: string,
  cause: unknown,
  message: string = authMessages.unavailable,
): Error {
  console.error(`[auth] ${context}`, cause)
  return authError(502, "auth_unavailable", message)
}
