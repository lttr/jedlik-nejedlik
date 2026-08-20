---
status: ready
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
---

# 03 — Registration

**What to build:** a visitor registers at `/registrace` with e-mail +
password only and is logged in immediately — no verification step, no
name fields. A passive line notes personal-data processing and links to
the privacy policy. Redirect rules match login.

## Acceptance criteria

- [ ] Nitro register route creates the Directus user via the ticket-01
      service token; role is always Student
- [ ] Duplicate e-mail → specific Czech error; password shorter than 8
      chars → clear Czech error (client-side validated too)
- [ ] Successful registration ends logged in (same session shape as
      login) and honors `?redirect=`
- [ ] Per-IP rate limit on the register route; no captcha
- [ ] Logged-in Student opening `/registrace` is forwarded onward
- [ ] Probes: register via the route's contract creates exactly a
      Student; rate limit kicks in; cleanup removes throwaway users

## Rework notes

- **No hardcoded `STUDENT_ROLE_ID`** — the first implementation baked
  the UUID into source twice (route + probe), which silently does the
  wrong thing against a rebuilt or staging instance. Preferred: omit
  `role` from the payload and let a preset on the service policy's
  create permission assign it (verify a preset applies and omitting
  `role` doesn't 400); fallbacks are a uuid-validated runtime-config
  key or deriving from the committed roles dump
  (`directus/config/collections/roles.json`). Never look the role up by
  name at runtime — magic string, extra request, and the service token
  is deliberately denied read access.
- **Lowercase the e-mail** as well as trimming it — check whether
  Directus normalises case itself; if not, `Foo@x.cz` and `foo@x.cz`
  become two accounts and the duplicate-e-mail error never fires.
- Accessibility: tie the password hint to its input with
  `aria-describedby`; add `autofocus`. (Applies to all four auth pages.)
- Dedups from the first implementation: the password-length pre-check
  belongs in the form composable or a `validatePassword` helper, not
  copy-pasted per page; `readCredentials`/`readRegistration` are one
  function with two schemas; the four `console.error` + `authError`
  pairs want one helper.
