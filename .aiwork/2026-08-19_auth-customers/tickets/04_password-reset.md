---
status: blocked
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
  - "ADR: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 04 — Password reset

**What to build:** a Student who forgot their password enters their
e-mail at `/obnova-hesla` and gets a uniform confirmation (whether or not
the e-mail exists). The Directus-sent e-mail links back to
`/obnova-hesla?token=…`, where they set a new password and are pointed to
login. Expired or used tokens get a clear Czech message with a way to
request a fresh link.

## Acceptance criteria

- [x] Both legs (request + completion) proxied through Nitro; the page
      never calls Directus directly — `POST /api/auth/password-request`
      and `POST /api/auth/password-reset`; `useAuthActions()` is the only
      caller and it only ever talks to our own routes
- [x] Request leg responds identically for known and unknown e-mails —
      structurally: the page has no branch on it, and Directus itself
      answers 204 either way. The probe that asserts the Directus half is
      written but **never executed** (see Outstanding).
- [x] Completion with a valid token sets the new password; login works —
      driven in the browser; the genuine Directus token needs an inbox and
      stays with ticket 06
- [x] Expired/used token → Czech error + link to request again —
      observed: the dead-link panel replaces the form and its "Poslat nový
      odkaz" button returns to the request leg
- [ ] Probe covers the request leg's uniform response; e-mail leg is
      deferred to ticket 06's manual round-trip — **written, not run**
      (see Outstanding)

## Outstanding — the probe suite was never executed

`obsah-jedlika.lttr.cz` answered `503 no available server` (Traefik: no
healthy backend) for the whole implementation session, 2026-08-28 ~11:45
to ~13:47 UTC, while Coolify's own resource list kept reporting the
`directus` service as `running:healthy`. Nothing in this ticket's code
could therefore be checked against the live instance, and in particular
the ops gate below is **undecided, not green**:

    web/tests/probes/auth.probe.ts
    "accepts the reset URL the app sends (PASSWORD_RESET_URL_ALLOW_LIST)"

Run `vp run directus:probe` (sandbox disabled) once the instance is back;
if that test is red, set on the Directus service

    PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla

which is byte-for-byte the `reset_url` the app sends (captured from the
running app against a local stand-in Directus).

Related ops finding, for ticket 06: the Coolify `directus` service's
compose references `PASSWORD_RESET_URL_ALLOW_LIST` in its `environment:`
block but **never mentions `USER_REGISTER_URL_ALLOW_LIST`**, even though a
Coolify env entry with that key exists. That is a concrete candidate
explanation for ticket 03's still-red register gate: a key the compose
does not reference is not substituted into the container.

## Rework notes

- [x] **Clear the token from the URL** after a successful reset with
      `replaceState` — otherwise it stays in history and referrer. Done up
      front instead of after, via the extracted `useEmailedToken()`; observed
      `/obnova-hesla?token=…` → `/obnova-hesla`.
- [x] Accessibility: `aria-describedby` on the password hint, `autofocus`,
      same as the other auth pages. Both now live in `AuthPasswordField`,
      shared with `/registrace`.
