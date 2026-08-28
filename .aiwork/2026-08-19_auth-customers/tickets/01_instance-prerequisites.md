---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
  - "ADR: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 01 — Directus instance prerequisites (ops)

**What to build:** the Directus instance is ready for the auth flows:
native public registration is on and assigns the Student role, the
verification and reset e-mails may link back to the site, sessions slide
for 30 days, and a Student may change their own password. Mostly ops on
the instance; the repo's job is to capture the result in the committed
directus-sync dump.

Rewritten 2026-08-28: the service user / create-Student-only policy /
static token are **gone** — registration now uses Directus's native
public-registration endpoint (spec, Registration). Nothing here needs a
secret handed to the implementer.

## Acceptance criteria

- [ ] Settings: `public_registration: true`
- [ ] Settings: `public_registration_role` = Student
      (`186fdb62-3231-4322-8491-2c3dd8124842`)
- [ ] Settings: `public_registration_verify_email: true`
- [ ] Student policy gains own-row `update` on `directus_users`, fields
      narrowed to `password` (for ticket 05). Model it on the existing
      Redaktor row: filter `{"id": {"_eq": "$CURRENT_USER"}}`
- [ ] All four of the above appear in the committed dump after
      `vp run directus:pull` — a clean pull is the proof the ops work
      landed, not a checked box
- [ ] Instance env: `USER_REGISTER_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/overeni-emailu`
- [x] Instance env: `REFRESH_TOKEN_TTL=30d` — **unverified, re-check**
- [x] Instance env: `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`
      (verified live: allowed URL → 204, other URL → 400)
- [ ] Site env (Coolify `jedlik-nejedlik-production`):
      `NUXT_SESSION_PASSWORD`, ≥32 chars
- [ ] Probe tokens available: `DIRECTUS_PROBE_ADMIN_TOKEN` (already in
      `web/.env`)

## Notes

**Correction, 2026-08-28.** The previous rework note claimed "applied by
the user on 2026-08-19: the service user and its create-Student-only
policy, its static token (present in Coolify as
`NUXT_DIRECTUS_SERVICE_TOKEN`)". That was **false** — the user confirmed
the env var does not exist in Coolify and the policy is not in the Data
Studio, and `policies.json` lists only MCP, Public, Redaktor,
Administrator, Student, Autor. Nothing to delete. Because one claim in
that note was wrong, `REFRESH_TOKEN_TTL` above is marked for re-checking;
`PASSWORD_RESET_URL_ALLOW_LIST` keeps its tick because it carries
recorded live evidence.

A `read` permission on `directus_users` is **not** needed: the
nuxt-auth-utils session carries the Student's e-mail (ticket 02), so
nothing calls `readMe` per render.

A `vp run directus:pull` on 2026-08-28 came back with an empty diff,
i.e. none of the four settings changes were on the instance at that
point. Re-run it and commit the diff as part of closing this ticket.
