import { z } from "zod"

// Imported rather than auto-imported so this stays a plain module the unit
// suite can load (tests/unit/auth-errors.test.ts).
import { authMessages } from "../../shared/utils/auth-messages"

// Nitro sends the Czech text of a `createError` as the body's `message` and its
// `code` — the second argument to `authError` — as `statusMessage`; anything
// else that reaches here (network failure, unexpected 500) is not something a
// Student can act on.
const FetchErrorBody = z.object({
  data: z.object({ message: z.string().min(1), statusMessage: z.string().optional() }),
})

export interface AuthFailure {
  // Shown to the Student.
  message: string
  // The route's own name for what went wrong, for the rare form that has to
  // react to *which* failure rather than just report it. Empty when the
  // failure did not come from one of our routes.
  code: string
}

export function authFailure(error: unknown): AuthFailure {
  const parsed = FetchErrorBody.safeParse(error)
  if (!parsed.success) {
    return { message: authMessages.unexpected, code: "" }
  }
  return { message: parsed.data.data.message, code: parsed.data.data.statusMessage ?? "" }
}
