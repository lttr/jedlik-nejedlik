---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
  - "ADR: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 01 — Directus instance prerequisites (ops)

**What to build:** the Directus instance is ready for the auth flows: a
service identity exists that can create Student users and nothing else,
sessions slide for 30 days, and the reset e-mail may link back to the
site. Partly repo work (config dump), partly ops on the instance.

## Acceptance criteria

- [ ] Service user with a "create Student-role users only" policy exists;
      role/policy/permissions are in the committed directus-sync dump
- [ ] Static token generated for the service user and stored where local
      dev and Coolify expect it (never committed)
- [ ] Instance env: `REFRESH_TOKEN_TTL=30d`
- [ ] Instance env: `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`
- [ ] `public_registration` remains off
- [ ] Probe (or documented manual check) proves the service token cannot
      create a user with any role other than Student, nor read/update
      existing users
