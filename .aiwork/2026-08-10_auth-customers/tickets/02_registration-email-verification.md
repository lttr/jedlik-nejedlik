---
status: ready
blocked_by: [01]
references:
  - "Spec: ../spec.md"
---

# 02 — Registration + e-mail verification

**What to build:** the account-first entry point (O-17) — a Student
registers with e-mail + password, Directus assigns the Student role and
sends the verification e-mail, and the link lands on our page which posts
the token back through our own route.

Covers spec decision 3 and the registration half of decision 6. The
instance-side switches that make this work live are ticket 04.

## Acceptance criteria

- [ ] `POST /api/auth/register` validates input and calls Directus
      `registerUser` with the verification URL pointing at
      `/registrace/overeni`
- [ ] Registration answers 204 whether or not the e-mail already exists —
      no enumeration through status code, body, or timing shape
- [ ] `POST /api/auth/verify` calls Directus `registerUserVerify` and maps
      an expired or already-used token to its own Czech message, distinct
      from a generic failure
- [ ] `/registrace` page with the register form; password rules stated up
      front and matching the codec's 8-character minimum
- [ ] `/registrace/overeni` page reads `?token=`, posts it, and on success
      offers login rather than auto-authenticating
- [ ] Registering does not create a session
- [ ] Unit tests green for the register codec and the verification error
      mapping
- [ ] `vp run verify:all` green
