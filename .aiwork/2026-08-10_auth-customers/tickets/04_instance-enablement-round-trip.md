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

## Also owns every Directus interaction in tickets 01–03

`obsah-jedlika.lttr.cz` is not in the agent environment's network egress
allowlist, so **no agent session could exercise a single Directus call** —
the marketing site's own `/clanky` 404s there for the same reason. Tickets
01–03 verified everything up to the Directus boundary (validation, status
codes, messages, session redirects, page rendering) and nothing past it.

So this ticket is the first check of:

- [ ] Login with correct credentials sets a session; wrong credentials give
      the single generic message
- [ ] The signed-in `GET /api/_auth/session` payload carries `user` and no
      token fields, and the session cookie is httpOnly + `SameSite=Lax` +
      Secure with a 30-day `maxAge`
- [ ] The session survives a page reload, and an expired access token is
      refreshed transparently rather than logging the Student out
- [ ] Logout revokes the refresh token at Directus, not just locally
- [ ] An expired or reused verification token yields the 410 message
      rather than the generic 502 — the code mapping in `verify.post.ts`
      (`TOKEN_EXPIRED` / `INVALID_TOKEN` / `INVALID_PAYLOAD`) is a
      documented guess, unverifiable while registration is disabled, and
      should be corrected against what Directus actually returns
