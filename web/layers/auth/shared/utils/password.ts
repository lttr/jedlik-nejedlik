import { authMessages } from "./auth-messages"

// The instance's `auth_password_policy` is `/^.{8,}$/` — a minimum length and
// nothing else (read from the live settings and asserted by
// tests/probes/auth.probe.ts). Keep this in step with it: Directus stays the
// enforcement boundary (R-5), and answers a short password with
// `FAILED_VALIDATION` whatever the browser thinks. Checking here only saves
// the Student a round-trip and a server error they cannot read.
export const PASSWORD_MIN_LENGTH = 8

// The Czech complaint about a password, or null when it satisfies the policy.
// Shared by every form that sets a password — registration, reset completion
// and change-password — so the rule and its wording live in one place.
export function validatePassword(password: string): string | null {
  return password.length < PASSWORD_MIN_LENGTH ? authMessages.passwordTooShort : null
}
