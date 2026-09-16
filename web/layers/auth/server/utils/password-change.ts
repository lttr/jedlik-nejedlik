// The write goes through the Account's own Directus session: the app holds no
// other credential, and the Student policy allows updating only `password` and
// the billing fields on the own `directus_users` row.
import { readMe, updateUser } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { PasswordChange } from "../../shared/types/account"

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string(),
})

export async function readPasswordChange(event: H3Event): Promise<PasswordChange> {
  const change = await readAuthBody(
    event,
    PasswordChangeSchema,
    // A malformed body answers exactly like a wrong current password.
    authError(401, "invalid_password", authMessages.currentPasswordWrong),
  )
  assertPasswordPolicy(change.newPassword)
  return change
}

// Directus deletes every session of a user whose password changed, sparing
// only the one named in the access token's `session` claim, which only
// cookie-mode logins carry. Ours are `mode: "json"`, so the change signs the
// Account out everywhere, this browser included; the re-login below keeps it
// signed in. Asserted by the probe.
export async function changeAccountPassword(event: H3Event, change: PasswordChange): Promise<void> {
  const { account, client } = await requireAccountDirectusClient(event)

  // Directus has no "verify password" endpoint, so the check is a real login.
  // A session cookie alone must not be enough to take an account over.
  const proof = await authenticateAccount(
    event,
    { email: account.email, password: change.currentPassword },
    authMessages.passwordChangeUnavailable,
  )
  if (proof === null) {
    throw authError(401, "invalid_password", authMessages.currentPasswordWrong)
  }
  // Revoked now rather than left to the password change: if the change fails,
  // this proof session must not survive.
  await revokeRefreshToken(event, proof.refreshToken)

  // `PATCH /users/<id>`, not `/users/me`. Both work today: the Student policy
  // now reads the own row, so the read-back Directus does before replying
  // succeeds and `/users/me` no longer answers 403 over a written password
  // (probe). The by-id form is kept because it does not depend on that read
  // rule at all — narrowing the rule again would turn `/users/me` back into a
  // lie, and a password change is the wrong place to learn that.
  try {
    const { id } = await client.request(readMe({ fields: ["id"] }))
    await client.request(updateUser(id, { password: change.newPassword }))
  } catch (error) {
    throw unexpectedAuthError(
      "Directus rejected a password change",
      error,
      authMessages.passwordChangeUnavailable,
    )
  }

  try {
    await logInAccount(event, { email: account.email, password: change.newPassword })
  } catch (error) {
    // The password did change; only this session failed to re-establish. Its
    // refresh token is one Directus just deleted, so drop it.
    console.error("[auth] Could not re-issue a session after a password change", error)
    await dropAccountSession(event)
    throw authError(502, "auth_unavailable", authMessages.passwordChangedLogInAgain)
  }
}
