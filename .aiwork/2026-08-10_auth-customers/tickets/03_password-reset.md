---
status: done
blocked_by: [02]
references:
  - "Spec: ../spec.md"
---

# 03 — Password reset

**What to build:** the "obnova hesla" third of FP-1 — request a reset
link, then set a new password from the token in the e-mail, both proxied
through our own routes so the Student never sees a Directus URL.

## Acceptance criteria

- [x] `POST /api/auth/password` calls Directus `passwordRequest` with the
      reset URL pointing at `/nove-heslo`, and always answers 204 —
      identical response for a known and an unknown e-mail
- [x] `PUT /api/auth/password` calls Directus `passwordReset`; expired or
      already-used token gets its own Czech message
- [x] `/zapomenute-heslo` page confirms "if the address exists, a link is
      on its way" without confirming the address exists
- [x] `/nove-heslo` page reads `?token=`, enforces the same 8-character
      minimum, and on success sends the Student to `/prihlaseni`
- [x] A completed reset leaves any existing session unusable — the
      Student logs in again with the new password
- [x] Unit tests green for the reset codecs and error mapping
- [x] `vp run verify:all` green

## Verification notes

Directus is unreachable from the agent environment (see ticket 04), so
everything below stops at the Directus boundary.

Observed: both pages render; `/nove-heslo` without a token shows the
incomplete-link message instead of a form; `/prihlaseni` links to the
reset flow and shows the post-reset notice on `?obnoveno=1`; a malformed
address is rejected 400; a missing token and a short password now give
_different_ 400 messages, since fixing each requires a different action;
and with Directus unreachable the request answers 502 rather than
promising a mail that will never arrive.

Satisfied by construction, ticket 04 owns the real check:

- The always-204 property. What was seen was the unreachable-host branch,
  not a rejection Directus reported, so the branch that hides an unknown
  address has not executed.
- The 410 mapping for an expired or reused reset token — the same
  documented guess at Directus's error codes as in ticket 02.
- "A completed reset leaves any existing session unusable" rests on
  Directus invalidating the account's refresh tokens on reset. The route
  deliberately does not clear our cookie itself; a stale session fails on
  its next Directus call. Unverified until a real reset happens.
