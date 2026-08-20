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
- [x] Instance env: `REFRESH_TOKEN_TTL=30d`
- [x] Instance env: `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`
      (verified live: allowed URL → 204, other URL → 400)
- [ ] `public_registration` remains off
- [ ] Probe (or documented manual check) proves the service token cannot
      create a user with any role other than Student, nor read/update
      existing users

## Rework notes

Applied by the user on 2026-08-19: the service user and its
create-Student-only policy, its static token (present in Coolify as
`NUXT_DIRECTUS_SERVICE_TOKEN`), both env vars above, and
`public_registration` still off. Still outstanding:

- [ ] Service role/policy/permissions committed to the directus-sync
      dump — `vp run directus:pull` with an admin token
- [ ] Student policy on `directus_users`, own row: `update` (`password`)
      for ticket 05. A `read` (`id`, `email`) permission is needed only
      if the session does not carry the Student's e-mail — with
      nuxt-auth-utils (ticket 02) it does, so this is likely unneeded;
      confirm before closing
- [ ] Probe tokens available: `DIRECTUS_PROBE_SERVICE_TOKEN`,
      `DIRECTUS_PROBE_ADMIN_TOKEN`
- [ ] If role assignment moves to a permission **preset** (ticket 03),
      that preset on the service policy's create permission is committed
      to the dump
