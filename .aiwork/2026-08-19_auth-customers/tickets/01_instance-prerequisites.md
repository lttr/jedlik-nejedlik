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

## Outstanding

The instance work was applied by the user on 2026-08-19. The implementing
session had no Directus admin credentials, so the criteria that depend on
repo artefacts or on running the probes stay unchecked:

- The service role/policy/permissions are live on the instance but **not yet
  in the committed directus-sync dump** — needs `vp run directus:pull` with
  an admin token.
- The service token is set in the Coolify environment (the preview for
  PR #16 boots, which the runtime-config schema would refuse without
  `NUXT_DIRECTUS_SERVICE_TOKEN`); `web/.env` for local dev is unverified
  from here.
- `web/tests/probes/auth.probe.ts` covers the "service token cannot create a
  non-Student, nor read or update existing users" check but **has not been
  run** — needs the probe tokens.

See `../ops-checklist.md` for the full list.
