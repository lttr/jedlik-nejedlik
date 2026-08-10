---
status: done
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

- [x] `POST /api/auth/register` validates input and calls Directus
      `registerUser` with the verification URL pointing at
      `/registrace/overeni`
- [x] Registration answers 204 whether or not the e-mail already exists —
      no enumeration through status code, body, or timing shape
- [x] `POST /api/auth/verify` calls Directus `registerUserVerify` and maps
      an expired or already-used token to its own Czech message, distinct
      from a generic failure
- [x] `/registrace` page with the register form; password rules stated up
      front and matching the codec's 8-character minimum
- [x] `/registrace/overeni` page reads `?token=`, posts it, and on success
      offers login rather than auto-authenticating
- [x] Registering does not create a session
- [x] Unit tests green for the register codec and the verification error
      mapping
- [x] `vp run verify:all` green

## Verification notes

Directus is unreachable from the agent environment (see ticket 04), so
everything below stops at the Directus boundary.

Observed: `/registrace` and `/registrace/overeni` render; `/prihlaseni`
links to registration and back; a short password is rejected 400 before
any Directus call; an empty verification token is rejected 400; and with
Directus unreachable both registration and login answer 502 "dočasně
nedostupné" rather than a false "check your inbox" or a false "wrong
password".

**Two criteria are satisfied by construction, not by observation**, and
ticket 04 owns their real check:

- The 204-on-already-registered branch. Registration was seen answering
  204 while failing, but that was the unreachable host being swallowed,
  not a rejection Directus reported. The branch that actually hides a
  taken address has never executed.
- The 410 mapping for an expired or reused verification token. The codes
  it keys on (`TOKEN_EXPIRED` / `INVALID_TOKEN` / `INVALID_PAYLOAD`) are a
  documented guess; what Directus really returns cannot be seen while
  public registration is off.
