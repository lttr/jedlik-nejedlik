// Changing a password from the account page, without the e-mail flow.
//
// The write goes through the Student's own Directus session (ADR 0002): the
// app holds no other credential, and the Student policy allows `update` on
// `directus_users` for the own row, `password` field only.
import { readMe, updateUser } from "@directus/sdk"
import type { H3Event } from "h3"
import { z } from "zod"

import type { PasswordChange } from "../../shared/types/student"

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string(),
})

export async function readPasswordChange(event: H3Event): Promise<PasswordChange> {
  const change = await readAuthBody(
    event,
    PasswordChangeSchema,
    // A malformed body says exactly what a wrong current password says: the
    // route never explains more about the session than the Student asked.
    authError(401, "invalid_password", authMessages.currentPasswordWrong),
  )
  assertPasswordPolicy(change.newPassword)
  return change
}

// Directus deletes every session row of a user whose password changed
// (UsersService.updateMany → clearUserSessions), and it spares only the
// session named in the access token's `session` claim — a claim that exists
// only for cookie-mode logins. Ours are `mode: "json"`, so nothing is spared:
// the change signs the Student out of every device, this one included.
// Asserted by tests/probes/auth.probe.ts; the re-login below is what keeps
// the browser that made the change logged in.
export async function changeStudentPassword(event: H3Event, change: PasswordChange): Promise<void> {
  const { student, client } = await requireStudentDirectusClient(event)

  // A session cookie alone must not be enough to take an account over, and
  // Directus has no "verify password" endpoint — so the check is a real
  // login, whose session has served its purpose the moment it succeeds.
  const proof = await authenticateStudent(
    event,
    { email: student.email, password: change.currentPassword },
    authMessages.passwordChangeUnavailable,
  )
  if (proof === null) {
    throw authError(401, "invalid_password", authMessages.currentPasswordWrong)
  }
  // The password change below would delete this session too, but only if it
  // gets that far. Revoking here is what keeps a change that fails afterwards
  // from leaving a 30-day session behind, ten times per quarter-hour.
  await revokeRefreshToken(event, proof.refreshToken)

  // Not `PATCH /users/me`: that handler reads the row back afterwards without
  // catching a refused read, so for a Student — who has no `read` on
  // `directus_users` at all — it answers 403 with the new password already
  // written. `PATCH /users/<id>` does catch it and answers cleanly, so the
  // route asks who it is first. Both halves are asserted by the probe.
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
    await logInStudent(event, { email: student.email, password: change.newPassword })
  } catch (error) {
    // The password did change; only re-establishing this session failed. Say
    // so, and leave no half-dead session behind — its refresh token is one of
    // the ones Directus just deleted.
    console.error("[auth] Could not re-issue a session after a password change", error)
    await dropStudentSession(event)
    throw authError(502, "auth_unavailable", authMessages.passwordChangedLogInAgain)
  }
}
