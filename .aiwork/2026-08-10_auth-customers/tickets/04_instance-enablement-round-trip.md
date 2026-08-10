---
status: ready
blocked_by: [03]
references:
  - "Spec: ../spec.md"
---

# 04 — Directus instance enablement + live round-trip (HUMAN)

**What to do:** switch on the instance-side settings the code in tickets
01–03 expects, then prove the whole identity flow against the real
Directus with a real inbox.

**Human-only.** directus-sync is pull-only and no `DIRECTUS_TOKEN` is
available to an agent session, so the settings must be changed in the
admin app / Coolify by a person. The round-trip needs a real mailbox.

## Instance settings

In the Directus admin app (Settings → project):

- `public_registration` → on
- `public_registration_role` → Student
- `public_registration_verify_email` → on

As Directus env vars in Coolify (restart required):

- `USER_REGISTER_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/registrace/overeni`
- `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/nove-heslo`

In the deployed app's env:

- `NUXT_SESSION_PASSWORD` — 32+ random characters, never committed

## Acceptance criteria

- [ ] Instance settings above applied and the app env var set
- [ ] Live round-trip passes: register → verification e-mail arrives →
      link verifies → login → `/ucet` shows the e-mail → logout → reset
      request → reset e-mail arrives → new password → login again
- [ ] The new account carries the Student role and nothing more
- [ ] Registering an already-registered e-mail leaks nothing to the
      visitor
- [ ] Friction encountered is recorded in `../implementation-notes.md`
- [ ] `vp run directus:pull` re-run and the settings diff committed
