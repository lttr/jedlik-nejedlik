import { z } from "zod"

// Nitro sends the Czech text of a `createError` as the body's `message`;
// anything else that reaches here (network failure, unexpected 500) is not
// something a Student can act on.
const FetchErrorBody = z.object({
  data: z.object({ message: z.string().min(1) }),
})

export function authErrorMessage(error: unknown): string {
  const parsed = FetchErrorBody.safeParse(error)
  return parsed.success ? parsed.data.data.message : authMessages.unexpected
}
