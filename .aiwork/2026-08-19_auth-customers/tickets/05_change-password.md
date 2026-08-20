---
status: ready
blocked_by: [02]
references:
  - "Spec: ../spec.md"
---

# 05 — Change password on the account page

**What to build:** a logged-in Student changes their password from
`/muj-ucet` without the e-mail flow, and the session keeps working.

## Acceptance criteria

- [ ] Change goes through the session-bound server client (never the
      service token)
- [ ] Student policy gains own-password-update permission, committed to
      the Directus dump
- [ ] Password policy violations show the same Czech error as
      registration
- [ ] Probe proves a Student can update their own password and cannot
      update another user's

## Rework notes

- **Changing the password must invalidate other sessions**, or a
  "log out everywhere" must exist — someone changing their password
  because they suspect compromise must not leave the attacker signed in
  for up to 30 days.
