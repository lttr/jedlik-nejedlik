import { z } from "zod"

// Explicit import so the unit suite can load this as a plain module.
import { authMessages } from "../../shared/utils/auth-messages"

// Nitro sends `createError`'s Czech `message` and, as `statusMessage`, the
// code passed to `authError`. Anything else (network failure, unexpected 500)
// is not something a Student can act on.
const FetchErrorBody = z.object({
  data: z.object({ message: z.string().min(1), statusMessage: z.string().optional() }),
})

export interface AuthFailure {
  message: string
  // The route's own code, empty when the failure did not come from our routes.
  code: string
}

export function authFailure(error: unknown): AuthFailure {
  const parsed = FetchErrorBody.safeParse(error)
  if (!parsed.success) {
    return { message: authMessages.unexpected, code: "" }
  }
  return { message: parsed.data.data.message, code: parsed.data.data.statusMessage ?? "" }
}
