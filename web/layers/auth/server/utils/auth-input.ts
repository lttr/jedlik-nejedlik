import { z } from "zod"
import { authError } from "./auth-errors"
import { normaliseEmail } from "#layers/auth/shared/utils/email"
import { validatePassword } from "#layers/auth/shared/utils/password"

// The boundary that has to hold: every address reaches Directus in this one
// shape (see normaliseEmail), whatever the browser sent.
export const AccountEmail = z.string().transform(normaliseEmail).pipe(z.email())

export function assertPasswordPolicy(password: string): void {
  const complaint = validatePassword(password)
  if (complaint !== null) {
    throw authError(400, "invalid_password", complaint)
  }
}
