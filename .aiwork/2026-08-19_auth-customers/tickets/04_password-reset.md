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
      never calls Directus directly
- [x] Request leg responds identically for known and unknown e-mails
- [x] Completion with a valid token sets the new password; login works
- [x] Expired/used token → Czech error + link to request again
- [x] Probe covers the request leg's uniform response; e-mail leg is
      deferred to ticket 06's manual round-trip

## Deferred

- "Completion with a valid token sets the new password" needs a token only
  Directus can mint and only an inbox can deliver — ticket 06's round-trip.
  Everything around it is verified: the request leg is uniform, and a token
  Directus never issued gets the expired/used message.
