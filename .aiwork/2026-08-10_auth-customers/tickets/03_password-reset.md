---
status: ready
blocked_by: [02]
references:
  - "Spec: ../spec.md"
---

# 03 — Password reset

**What to build:** the "obnova hesla" third of FP-1 — request a reset
link, then set a new password from the token in the e-mail, both proxied
through our own routes so the Student never sees a Directus URL.

## Acceptance criteria

- [ ] `POST /api/auth/password` calls Directus `passwordRequest` with the
      reset URL pointing at `/nove-heslo`, and always answers 204 —
      identical response for a known and an unknown e-mail
- [ ] `PUT /api/auth/password` calls Directus `passwordReset`; expired or
      already-used token gets its own Czech message
- [ ] `/zapomenute-heslo` page confirms "if the address exists, a link is
      on its way" without confirming the address exists
- [ ] `/nove-heslo` page reads `?token=`, enforces the same 8-character
      minimum, and on success sends the Student to `/prihlaseni`
- [ ] A completed reset leaves any existing session unusable — the
      Student logs in again with the new password
- [ ] Unit tests green for the reset codecs and error mapping
- [ ] `vp run verify:all` green
