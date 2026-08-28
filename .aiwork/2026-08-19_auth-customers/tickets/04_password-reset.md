---
status: in-progress
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
      the page shows one confirmation because Directus itself answers 204
      either way (probe: "answers an unknown address exactly like a
      registered one")
- [x] Completion with a valid token sets the new password; login works —
      driven in the browser; the genuine Directus token needs an inbox and
      stays with ticket 06
- [x] Expired/used token → Czech error + link to request again —
      observed: the dead-link panel replaces the form and its "Poslat nový
      odkaz" button returns to the request leg
- [x] Probe covers the request leg's uniform response; e-mail leg is
      deferred to ticket 06's manual round-trip

## Rework notes

- [x] **Clear the token from the URL** after a successful reset with
      `replaceState` — otherwise it stays in history and referrer. Done up
      front instead of after, via the extracted `useEmailedToken()`; observed
      `/obnova-hesla?token=…` → `/obnova-hesla`.
- [x] Accessibility: `aria-describedby` on the password hint, `autofocus`,
      same as the other auth pages. Both now live in `AuthPasswordField`,
      shared with `/registrace`.
