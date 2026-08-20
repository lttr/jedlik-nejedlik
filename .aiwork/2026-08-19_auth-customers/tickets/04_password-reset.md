---
status: ready
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

- [ ] Both legs (request + completion) proxied through Nitro; the page
      never calls Directus directly
- [ ] Request leg responds identically for known and unknown e-mails
- [ ] Completion with a valid token sets the new password; login works
- [ ] Expired/used token → Czech error + link to request again
- [ ] Probe covers the request leg's uniform response; e-mail leg is
      deferred to ticket 06's manual round-trip

## Rework notes

- **Clear the token from the URL** after a successful reset with
  `replaceState` — otherwise it stays in history and referrer.
- Accessibility: `aria-describedby` on the password hint, `autofocus`,
  same as the other auth pages.
