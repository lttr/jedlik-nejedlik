import { authMessages } from "./auth-messages"

// The instance's `auth_password_policy` is `/^.{8,}$/`, a length and nothing
// else (asserted by the probe). Directus stays the enforcement boundary;
// checking here only saves the Student a round-trip.
export const PASSWORD_MIN_LENGTH = 8

export function validatePassword(password: string): string | null {
  return password.length < PASSWORD_MIN_LENGTH ? authMessages.passwordTooShort : null
}
