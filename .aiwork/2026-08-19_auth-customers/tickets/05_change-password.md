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

- [x] Change goes through the session-bound server client (never the
      service token)
- [ ] Student policy gains own-password-update permission, committed to
      the Directus dump
- [x] Password policy violations show the same Czech error as
      registration
- [x] Probe proves a Student can update their own password and cannot
      update another user's

## Deferred

- **The Student policy still needs its own-password-update permission.**
  That is an instance change and this session had no Directus admin
  credentials; it is written up in `../ops-checklist.md` (§2) together with
  the read permission ticket 02 needs. Until it is applied the route answers
  502 and the probe's "can be changed by its owner" test fails — which is
  exactly the signal that the permission is missing.
- Running the probe needs the tokens listed in `../ops-checklist.md` (§4).
