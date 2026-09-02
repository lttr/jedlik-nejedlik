// Both legs of "forgot password", proxied to Directus's native endpoints.
// Directus mints the token and sends the e-mail; our code only sees the token
// when the Student brings it back.
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
  // A missing token is a dead link like any other.
  const reset = await readAuthBody(
    event,
    ResetSchema,
    authError(400, "invalid_token", authMessages.resetFailed),
  )
  assertPasswordPolicy(reset.password)
  return reset
}

// Directus answers 204 whether or not the address has an account, so accounts
// stay unenumerable; the page's confirmation is written for both.
export async function requestPasswordReset(event: H3Event, email: string): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(
      // Must be on the instance's PASSWORD_RESET_URL_ALLOW_LIST, else 400.
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

export async function resetStudentPassword(
  event: H3Event,
  { token, password }: PasswordReset,
): Promise<void> {
  try {
    await getDirectusAnonymousServerClient(event).request(passwordReset(token, password))
  } catch (error) {
    const code = directusErrorCode(error)
    // Expired, used and forged tokens need not share a Directus code, and the
    // Student is told one thing about all of them, so branch on what is *not*
    // about the link. FAILED_VALIDATION can only mean Directus disagrees with
    // PASSWORD_MIN_LENGTH: `readPasswordReset` already checked the length.
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
