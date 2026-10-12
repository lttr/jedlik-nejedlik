// Both legs of "forgot password", proxied to Directus's native endpoints.
// Directus mints the token and sends the e-mail; our code only sees the token
// when the Account brings it back.
import { passwordRequest, passwordReset } from "@directus/sdk"
import type { RequestEvent } from "nuxt/server"
import { z } from "zod"
import { authError, directusErrorCode, unexpectedAuthError } from "./auth-errors"
import { AccountEmail, assertPasswordPolicy, readAuthBody } from "./auth-input"
import { authPageUrl } from "./auth-urls"
import { authMessages } from "#layers/auth/shared/utils/auth-messages"
import { RESET_PASSWORD_PATH } from "#layers/auth/shared/utils/redirects"
import { getDirectusAnonymousServerClient } from "#layers/directus/server/utils/directus-server"

const ResetRequestSchema = z.object({ email: AccountEmail })

const ResetSchema = z.object({ token: z.string().min(1), password: z.string() })

export type PasswordReset = z.infer<typeof ResetSchema>

export async function readResetRequest(event: RequestEvent): Promise<string> {
  const { email } = await readAuthBody(
    event,
    ResetRequestSchema,
    authError(400, "invalid_email", authMessages.invalidEmail),
  )
  return email
}

export async function readPasswordReset(event: RequestEvent): Promise<PasswordReset> {
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
export async function requestPasswordReset(event: RequestEvent, email: string): Promise<void> {
  try {
    await getDirectusAnonymousServerClient().request(
      // Must be on the instance's PASSWORD_RESET_URL_ALLOW_LIST, else 400.
      passwordRequest(email, authPageUrl(RESET_PASSWORD_PATH)),
    )
  } catch (error) {
    throw unexpectedAuthError(
      "Directus rejected a password-reset request",
      error,
      authMessages.resetRequestUnavailable,
    )
  }
}

export async function resetAccountPassword(
  event: RequestEvent,
  { token, password }: PasswordReset,
): Promise<void> {
  try {
    await getDirectusAnonymousServerClient().request(passwordReset(token, password))
  } catch (error) {
    const code = directusErrorCode(error)
    // Every bad link (expired, used, forged) gets the same answer, so only the
    // one failure that is not about the link is singled out. The length was
    // checked in `readPasswordReset`, so FAILED_VALIDATION here means Directus
    // disagrees with PASSWORD_MIN_LENGTH.
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
