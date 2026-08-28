import { z } from "zod"

// Czech goes in `message` — the browser shows it. `statusMessage` becomes the
// HTTP reason phrase, which must stay ASCII.
export function authError(statusCode: number, code: string, message: string): Error {
  return createError({ statusCode, statusMessage: code, message })
}

// Shape of a rejected @directus/sdk request: the parsed Directus error body.
// A transport failure (instance down, DNS, TLS) has no `errors` at all — which
// is exactly the distinction every caller here needs, so `undefined` means
// "Directus never answered", never "Directus said no".
const DirectusErrors = z.object({
  errors: z.array(z.object({ extensions: z.object({ code: z.string() }) })).min(1),
})

export function directusErrorCode(error: unknown): string | undefined {
  const parsed = DirectusErrors.safeParse(error)
  return parsed.success ? parsed.data.errors[0]?.extensions.code : undefined
}

// Something below the auth boundary broke in a way a Student cannot act on:
// log the cause for us, show them one generic sentence about the flow they
// were in.
export function unexpectedAuthError(
  context: string,
  cause: unknown,
  message: string = authMessages.unavailable,
): Error {
  console.error(`[auth] ${context}`, cause)
  return authError(502, "auth_unavailable", message)
}
