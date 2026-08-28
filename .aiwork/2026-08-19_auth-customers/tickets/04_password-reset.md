---
status: done
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
      answers 204 either way. The probe asserting the Directus half has
      now been executed and is green.
- [x] Completion with a valid token sets the new password; login works —
      driven in the browser; the genuine Directus token needs an inbox and
      stays with ticket 06
- [x] Expired/used token → Czech error + link to request again —
      observed: the dead-link panel replaces the form and its "Poslat nový
      odkaz" button returns to the request leg
- [x] Probe covers the request leg's uniform response — **run and green**
      on 2026-08-28 once the Directus service came back (90/90, twice
      consecutively). The e-mail leg itself stays with ticket 06's manual
      round-trip, which needs a real inbox

## Resolved 2026-08-28 — the probe suite ran and is green

`obsah-jedlika.lttr.cz` answered `503 no available server` (Traefik: no
healthy backend) for the whole implementation session, 2026-08-28 ~11:45
to ~13:47 UTC, while Coolify's own resource list kept reporting the
`directus` service as `running:healthy`. Nothing in this ticket's code
could be checked against the live instance during that session, and in
particular this ops gate was left undecided:

    web/tests/probes/auth.probe.ts
    "accepts the reset URL the app sends (PASSWORD_RESET_URL_ALLOW_LIST)"

The service came back on 2026-08-28 ~20:30 UTC. `vp run directus:probe`
(sandbox disabled) then passed **90/90 twice consecutively**, this gate
included — `PASSWORD_RESET_URL_ALLOW_LIST` is set correctly on the
instance and no change was needed. The related `USER_REGISTER_URL_ALLOW_LIST`
worry (ticket 03's register gate) also proved unfounded once the container
was healthy: that gate is green too, so the compose does substitute the
key. Both were symptoms of the outage, not of a misconfiguration.

## Rework notes

- [x] **Clear the token from the URL** after a successful reset with
      `replaceState` — otherwise it stays in history and referrer. Done up
      front instead of after, via the extracted `useEmailedToken()`; observed
      `/obnova-hesla?token=…` → `/obnova-hesla`.
- [x] Accessibility: `aria-describedby` on the password hint, `autofocus`,
      same as the other auth pages. Both now live in `AuthPasswordField`,
      shared with `/registrace`.
