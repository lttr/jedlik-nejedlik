---
status: ready
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
  - "ADR: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 03 — Registration + e-mail verification

**What to build:** a visitor registers at `/registrace` with e-mail +
password only — no name fields — and is told a verification e-mail is on
its way. The e-mail links to `/overeni-emailu?token=…`, which activates
the account and forwards to login. A passive line notes personal-data
processing and links to the privacy policy.

Rewritten 2026-08-28: was "Nitro route creates the user via a service
token, ends logged in". Now Directus native public registration with
verification.

## Flow

`/registrace` → Nitro `POST /users/register` with `verification_url`
→ always 204 → "check your inbox" state → Student clicks the e-mailed
link → `/overeni-emailu?token=…` → Nitro `GET /users/register/verify-email`
→ redirect to `/prihlaseni` with a Czech success notice → Student logs in.

Registration **does not** end logged in. `?redirect=` is therefore
honoured by login (ticket 02), not here.

## Acceptance criteria

- [ ] Nitro register route proxies `POST /users/register`; the page never
      calls Directus directly. No role in the payload — the instance
      assigns it from `public_registration_role`
- [ ] No user-creating credential anywhere in the app; grep proves no
      Student role UUID in `web/` source
- [ ] Uniform confirmation for fresh and already-registered e-mails
      (Directus answers 204 to both); the confirmation text tells an
      existing Student to log in instead
- [ ] Password shorter than 8 chars → clear Czech error, client-side
      before submit, via a shared `validatePassword` helper (not
      copy-pasted per page)
- [ ] `/overeni-emailu` activates a valid token and forwards to
      `/prihlaseni`; expired or already-used token → Czech explanation
      plus a route onward (story 31)
- [ ] Token cleared from the URL with `replaceState` after activation,
      as on the reset page
- [ ] Per-IP rate limit on the register route (reuse ticket 02's
      limiter); no captcha
- [ ] Logged-in Student opening `/registrace` is forwarded onward
- [ ] Accessibility: password hint tied to its input with
      `aria-describedby`, `autofocus` on the first field (all auth pages)
- [ ] Probes: register creates exactly a Student-role **Unverified**
      user; a duplicate e-mail also returns 204; an Unverified user
      cannot log in; verify-email activates; cleanup removes throwaways

## Notes

- **Lowercase the e-mail** as well as trimming it — check whether
  Directus normalises case itself; if not, `Foo@x.cz` and `foo@x.cz`
  become two accounts.
- Confirm the exact request property name for the verification URL
  (`verification_url` per the SDK docs) against the instance in the
  probe before relying on it.
- Dedups carried over from the first implementation:
  `readCredentials`/`readRegistration` are one function with two schemas;
  the four `console.error` + `authError` pairs want one helper.
- What the previous design bought and this one does not: a specific
  "this e-mail is already registered" error. Accepted deliberately — see
  the spec's Registration decision.
