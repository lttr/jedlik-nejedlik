---
status: done
blocked_by: [02]
references:
  - "Spec: ../spec.md"
---

# 05 — Change password on the account page

**What to build:** a logged-in Student changes their password from
`/muj-ucet` without the e-mail flow, and the session keeps working.

## Acceptance criteria

- [x] Change goes through the session-bound server client — the app has
      no other Directus credential
- [x] Student policy own-password-update permission in place and
      committed to the dump (provisioned in ticket 01)
- [x] Password policy violations show the same Czech error as
      registration
- [x] Probe proves a Student can update their own password and cannot
      update another user's

## Rework notes

- **Changing the password must invalidate other sessions.** Directus
  does **not** do this natively and exposes no "revoke all" endpoint —
  `/auth/logout` only kills the refresh token it is handed. Someone
  changing their password because they suspect compromise must not leave
  the attacker signed in for up to 30 days.
- Intended mechanism (verify it works before committing to it): give the
  Student policy a `delete` on `directus_sessions` filtered
  `{"user": {"_eq": "$CURRENT_USER"}}`, and have the change-password
  route drop the Student's other sessions through the session-bound
  client — no service identity, no admin escalation. If
  `directus_sessions` turns out not to accept policy permissions, fall
  back to an explicit "odhlásit všude" action and flag the gap.
