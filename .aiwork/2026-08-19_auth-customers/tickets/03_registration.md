---
status: done
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

- [x] Nitro register route proxies `POST /users/register`; the page never
      calls Directus directly. No role in the payload — the instance
      assigns it from `public_registration_role` (probe: the created row
      is Student-role; dev-server log shows the app's own request)
- [x] No user-creating credential anywhere in the app; grep proves no
      Student role UUID in `web/` source (`ea81589e` / `186fdb62` /
      `STUDENT_ROLE` / `SERVICE_TOKEN`: no hits)
- [x] Uniform confirmation for fresh and already-registered e-mails
      (probe: both 204; browser: both showed the same confirmation, which
      tells an existing Student to log in instead)
- [x] Password shorter than 8 chars → clear Czech error, client-side
      before submit, via the shared `validatePassword` helper
      (`shared/utils/password.ts`, 7 unit tests; observed in the browser)
- [x] `/overeni-emailu` activates a valid token and forwards to
      `/prihlaseni` with a Czech success notice; expired/used/missing
      token → Czech explanation plus routes onward (story 31). The
      activation leg was exercised with a temporary local stub — a real
      token needs inbox access and stays with ticket 06's manual
      round-trip
- [x] Token cleared from the URL after activation — observed: the address
      bar was `/overeni-emailu` with no query on both branches
- [x] Per-IP rate limit on the register route (ticket 02's limiter,
      10 / 15 min); measured closing at the 11th call with the Czech
      message. No captcha
- [x] Logged-in Student opening `/registrace` is forwarded onward
      (observed: to `/muj-ucet`, and to `?redirect=` when given)
- [x] Accessibility: password hint tied to its input with
      `aria-describedby` (resolves in the DOM), `autofocus` on the first
      field
- [x] Probes: register creates exactly a Student-role **Unverified**
      user; a duplicate e-mail also returns 204; an Unverified user
      cannot log in; verify-email rejects a dead token; cleanup removes
      throwaways — **all green**. The ops gate
      (`USER_REGISTER_URL_ALLOW_LIST`) went green on 2026-08-28 once the
      Directus service came back: 90/90 probes pass twice consecutively,
      and a browser registration against the live instance returns the
      Czech "ověřovací e-mail" confirmation instead of the old 502

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
