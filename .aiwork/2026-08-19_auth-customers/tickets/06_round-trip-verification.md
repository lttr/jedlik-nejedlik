---
status: in-progress
blocked_by: [03, 04, 05]
references:
  - "Spec: ../spec.md"
---

# 06 — Full round-trip verification

**What to build:** the area's verify criterion, proven on production:
register → verification e-mail → activate → login → logout → login →
reset e-mail → new password → login → change password. Documents the
outcome and closes the area.

## Acceptance criteria

- [ ] Documented manual round-trip completed, including **both** e-mail
      legs (verification and reset); Czech rendering of each checked
      (template override opened as follow-up only if poor) — **the only
      thing still open in this area.** Every leg that does not need an
      inbox was driven on 2026-08-28 (see below); the two e-mail legs need
      a real mailbox and are the user's to do
- [x] Full probe suite (area 01's + auth probes) green twice
      consecutively, self-cleaning — 90/90, 2026-08-28, `vp run
directus:probe` with `DIRECTUS_PROBE_ADMIN_TOKEN`, sandbox disabled;
      no `probe-*` rows left behind
- [x] Implementation notes written per the aiwork protocol (deviations,
      instance changes actually applied, follow-ups)

## Rework notes

Verification the previous run skipped — all reachable, do them:

- [x] Exercise the flows in a **real browser** (`aiwork:agent-browser`
      skill): submit handlers, client-side password check, errors
      rendering in the DOM, hydration warnings — not curl-only
- [x] Test `safeRedirectPath` **as shipped** (import the real export):
      `//host`, `/\host`, `/\/host`, absolute URLs, `javascript:`,
      control characters, non-string inputs
- [ ] Forge a refresh cookie (or the session cookie's equivalent) and
      hit a page: refresh-failure path, session clearing, real
      `Set-Cookie` flags
- [ ] Prove the rate-limit window **releases**, not just that it closes
- [x] `vp run directus:probe` with `DIRECTUS_PROBE_ADMIN_TOKEN`
      (no service token exists any more), sandbox disabled, twice
      consecutively

Process gotchas for the session doing this work:

- The pre-commit hook does not exist in a fresh checkout —
  `core.hooksPath` points at the generated `.vite-hooks/_`, created by
  `pnpm install` → `prepare: vp config`. Install before committing or
  nothing formats/lints, silently.
- No `git add -A` — stage explicit paths. Use `git commit -F <file>`;
  a heredoc on stdin hung against the hook.
- Never a password literal in a probe, even for a throwaway user —
  generate per run (GitGuardian scans PR history).
- Sandbox builds need `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`,
  or `@nuxt/fonts` dies on `SELF_SIGNED_CERT_IN_CHAIN`.
- `vp build` does not work; use `vp run build`. `vp run check:all` is
  the full gate (the `verify:*` tasks were renamed to `check:*`). Nitro
  no longer needs any service token; it does need `NUXT_SESSION_PASSWORD`,
  which nuxt-auth-utils auto-generates in dev.

## Session log — 2026-08-28, after the Directus outage cleared

Driven against the live instance (`obsah-jedlika.lttr.cz`, healthy again)
with a local `pnpm dev:agent` and `agent-browser`:

- **Registration** — `/registrace` submitted with a throwaway address;
  the page answers with the Czech "Poslali jsme vám ověřovací e-mail…"
  panel and the "Účet zatím není aktivní" explanation. This is the leg
  that used to 502; the `USER_REGISTER_URL_ALLOW_LIST` gate is green.
- **Login** — an active Student created through the admin API logs in and
  lands on `/muj-ucet`, greeted by e-mail address.
- **Change password** — current + new accepted; "Heslo bylo změněno. Na
  ostatních zařízeních jsme vás odhlásili." shown, and the tab stays
  logged in, so the route's re-login works as ticket 05 designed.
- **Logout → login with the new password** — both work; the old password
  is gone.
- **Reset request** — `/obnova-hesla` accepts the address and shows the
  uniform confirmation. No 400, so the instance recognises the app's
  `reset_url`.
- **Dead reset link** — `/obnova-hesla?token=bogus` renders the form,
  and submitting it swaps in the Czech dead-link panel with "Poslat nový
  odkaz".
- **Cleanup** — both throwaway users deleted; only the three permanent
  `probe-student-*` / `probe-author` fixtures remain.

Still open, needing a real inbox: opening the verification e-mail and the
reset e-mail, checking their Czech rendering, and completing each from
its genuine link.

Not provable through the API and therefore left unverified:
`REFRESH_TOKEN_TTL`. Directus exposes no field for it; `ACCESS_TOKEN_TTL`
is pinned by a probe (`data.expires === 15 * 60 * 1000`).
