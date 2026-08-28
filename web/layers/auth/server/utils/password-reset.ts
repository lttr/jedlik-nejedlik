// The two legs of "I forgot my password", both proxied to Directus's native
// endpoints (ADR 0002). Directus mints the reset token and sends the e-mail;
// our code never sees the token until the Student brings it back from their
// inbox, which is exactly why the mail itself stays Directus-native.
import { passwordRequest, passwordReset } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

const ResetRequestSchema = z.object({ email: StudentEmail })

const ResetSchema = z.object({ token: z.string().min(1), password: z.string() })

export type PasswordReset = z.infer<typeof ResetSchema>

export async function readResetRequest(event: H3Event): Promise<string> {
  const { email } = await readAuthBody(
    event,
    ResetRequestSchema,
    authError(400, "invalid_email", authMessages.invalidEmail),
  )
  return email
}

export async function readPasswordReset(event: H3Event): Promise<PasswordReset> {
  // A missing token is a dead link like any other, and says the same thing.
  const reset = await readAuthBody(
    event,
    ResetSchema,
    authError(400, "invalid_token", authMessages.resetFailed),
  )
  assertPasswordPolicy(reset.password)
  return reset
}

// Directus answers 204 whether or not the address has an account — it swallows
// the "no such user" case on purpose, so accounts stay unenumerable. Nothing
// here can tell the two apart, and the page's confirmation is written for both.
export async function requestPasswordReset(event: H3Event, email: string): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(
      // The instance only accepts a `reset_url` named in its own
      // PASSWORD_RESET_URL_ALLOW_LIST; anything else is 400 INVALID_PAYLOAD.
      passwordRequest(email, authPageUrl(event, RESET_PASSWORD_PATH)),
    )
  } catch (error) {
    throw unexpectedAuthError(
      "Directus rejected a password-reset request",
      error,
      authMessages.resetRequestUnavailable,
    )
  }
}

// Consumes the token from the reset e-mail and sets the new password. Expired,
// already used and forged tokens all come back as one Directus rejection,
// which is one message to a Student — the page offers a fresh link.
export async function resetStudentPassword(
  event: H3Event,
  { token, password }: PasswordReset,
): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(passwordReset(token, password))
  } catch (error) {
    const code = directusErrorCode(error)
    // Expired, used and forged tokens need not answer with the same Directus
    // code, and the Student is told the same thing about all of them anyway —
    // so the branch is on what is *not* about the link, which the probe pins
    // down instead. `undefined` means Directus never answered at all.
    if (code === "FAILED_VALIDATION") {
      throw authError(400, "invalid_password", authMessages.passwordTooShort)
    }
    if (code !== undefined) {
      throw authError(400, "invalid_token", authMessages.resetFailed)
    }
    throw unexpectedAuthError(
      "Directus rejected a password reset",
      error,
      authMessages.resetUnavailable,
    )
  }
}
