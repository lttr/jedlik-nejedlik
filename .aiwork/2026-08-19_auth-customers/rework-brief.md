---
references:
  - "PR #16 (existing implementation): claude/auth-customers-impl-bv37rx"
  - "Spec: spec.md"
  - "Grilling: grilling.md"
  - "ADR: ../../docs/adr/0002-nitro-mediated-auth-sessions.md"
  - "Ops checklist: ops-checklist.md on the impl branch (not on master)"
---

# Rework brief — area 02, auth / customers layer

Handoff for a session redoing this area better. A working implementation
already exists on `claude/auth-customers-impl-bv37rx` (PR #16) — read it for
the shape, then improve on the points below. Everything here came out of
reviewing that branch with the user.

**Requirements are settled — do not renegotiate them.** Read `spec.md`,
`grilling.md` and `docs/adr/0002-nitro-mediated-auth-sessions.md` first. The
routes (`/registrace`, `/prihlaseni`, `/obnova-hesla`, `/muj-ucet`), the
Czech copy, the non-enumerable login errors, the uniform reset response and
the Nitro-mediated architecture are all correct as built. What follows is
about _how_, not _what_.

## 1. Build it on nuxt-auth-utils

The single biggest improvement. The existing branch hand-rolls session
storage, and the previous session never checked whether a module already
solved it.

Replace `app/composables/student.ts`, `app/plugins/student.server.ts`,
`server/middleware/student.ts`, `layers/directus/server/utils/directus-session.ts`
and the `H3EventContext` augmentation (~200 lines) with `useUserSession()`
client-side and `setUserSession` / `getUserSession` / `requireUserSession` /
`clearUserSession` server-side.

The line count is not the point. Its session is a **sealed cookie carrying a
payload**, so the Student's e-mail lives in the session rather than being
fetched per request. That cascades:

- No `readMe` on every page render, so there is no Directus round-trip to
  avoid, so the `Accept`-header heuristic in the Nitro middleware is
  unnecessary — delete the whole idea.
- **The `directus_users` _read_ permission stops being required.** It is
  currently an open ops blocker (§7). Confirm this before telling anyone the
  item is closed.
- `readAuthenticatedStudent` — the 502-instead-of-redirect-loop guard —
  exists only to cover the case where Directus won't identify a live
  session. It goes too.
- Transparent refresh belongs in `sessionHooks.fetch`, a better home than
  the current `resolveDirectusAccessToken`.

Keep the Directus access + refresh tokens in the session's server-only area,
never in the part serialised to the client. Verify that area's exact name
against the module's docs rather than trusting this note.

Decide these explicitly rather than drifting into them:

- **ADR 0001** says nothing here may become a second store of identity. A
  sealed cookie holding the e-mail is arguably a cache, not a store — but it
  is a judgment call and the user should make it, not you.
- **GLOSSARY.md** says Student, never user or account, in identifiers. The
  module's API is `user`-shaped. Wrap it; don't leak `useUserSession()` into
  pages.
- One more env var (`NUXT_SESSION_PASSWORD`) and one more dependency.
- Sealed cookies cap at 4KB. Two Directus JWTs plus an e-mail fits, but it
  is a new constraint.

## 2. No hardcoded Directus IDs

The current branch has `STUDENT_ROLE_ID` as a literal UUID in
`server/utils/auth.ts` _and_ a hand-copied twin in `tests/probes/support.ts`,
joined only by a comment. That is instance state baked into source: against a
rebuilt or staging instance, registration silently does the wrong thing, and
it fails at the first registration rather than at boot.

In order of preference:

1. **Delete it.** The service user's policy already restricts creation to
   Student-role users. Put a **preset** on that create permission so Directus
   assigns `role` itself, and omit `role` from the route's payload entirely.
   Presets are already used this way in this repo (the student order preset
   with `$CURRENT_USER`). This removes the constant instead of relocating it,
   and makes the policy the single source of truth — the current code pins
   the role in two places and calls it defence in depth, which is a
   rationalisation. Check first that a preset applies for this policy and
   that omitting `role` doesn't 400.
2. A **validated runtime-config key** (`NUXT_DIRECTUS_STUDENT_ROLE_ID`) in
   `web/server/runtime-config.schema.ts` with a uuid check, so a bad value
   kills the boot the way `directusServiceToken` does. Costs another env var.
3. **Derive it from the committed dump** (`directus/config/collections/roles.json`),
   which is already authoritative and already in the repo. No env var, drift
   impossible, and it fixes the probe's duplicate copy at the same time —
   which options 1 and 2 do not.

Looking the role up by name at runtime is the worst option: it swaps a UUID
for the magic string `"Student"`, costs a request, and the service token is
deliberately denied read access.

## 3. Page titles

There is **no `titleTemplate` anywhere in the repo** — every page retypes
`… | Jedlík-nejedlík` while `site.name` sits configured in `nuxt.config.ts`.
The previous session copied that convention into four new pages instead of
questioning it.

- Set one `titleTemplate` (`"%s %separator %siteName"`) in `nuxt.config.ts`
  under `app.head` or in `app.vue`; pages then set bare titles like
  `"Přihlášení"`, and the separator has one home.
- **Check whether @nuxtjs/seo already applies a default template** keyed off
  `site.name`. If it does, every page in the repo currently renders the name
  twice — that is a bug, not a preference, and it changes the fix.
- The four auth pages are `robots: false`. `useSeoMeta` also emits `og:title`
  and friends, which is meaningless for pages that must never be indexed or
  shared. Use `useHead({ title })`.
- Fixing this repo-wide means editing the ~7 existing marketing pages. Do it
  as its own commit, not folded into the auth work.

## 4. Simplifications

Worth keeping from the existing branch:

- `useAuthForm()` — pending flag, error clearing, Czech error extraction,
  shared by all four pages.
- `authErrorMessage` parsing the error body with a zod schema rather than
  unsafe casts.
- `safeRedirectPath` resolving against a throwaway origin instead of
  enumerating escape sequences by hand. This is the right approach; it just
  needs a test (§6).

Still duplicated, fix them:

- The `if (password.length < PASSWORD_MIN_LENGTH)` pre-check is copy-pasted
  in three pages. Fold it into the form composable or a `validatePassword`
  helper. The previous session extracted only what the duplication tool
  flagged and stopped looking — don't do that.
- `readCredentials` and `readRegistration` are one function with two schemas
  and two error codes.
- Four `console.error(...)` + `authError(...)` pairs want one helper.

## 5. Functional gaps to close

- **E-mail is trimmed but not lowercased** at registration. If Directus does
  not normalise case itself — check, don't assume — `Foo@x.cz` and
  `foo@x.cz` become two accounts and the duplicate-e-mail error never fires.
  Cheapest real bug on the list.
- **No per-IP rate limit on login.** The spec delegates brute force to
  Directus's per-user `auth_login_attempts: 7`, which does nothing about
  credential stuffing spread across many accounts. Registration and
  password-request are limited; login is not. Inconsistent.
- **Changing a password does not invalidate other sessions**, and there is no
  "log out everywhere". Someone who changes their password because they
  suspect compromise keeps the attacker signed in for up to 30 days.
- **The reset token stays in the URL** after a successful reset — history and
  referrer. A `replaceState` clears it.
- The rate limiter is per Nitro process and in memory, so budgets reset on
  every deploy and double if a second instance appears. It also trusts
  `X-Forwarded-For`, which a client controls; fixing that properly means
  configuring which proxy hop to trust.
- **Accessibility**: the password hint is not tied to its input with
  `aria-describedby`, and there is no `autofocus`. `AuthFormError` has
  `role="alert"`, which is the one thing that was done.
- If Directus is unreachable, every logged-in visitor silently renders as
  logged out rather than seeing an error.

## 6. Verification the previous run did not do

All of these were reachable and were skipped. Do them.

- **Run a real browser.** Chromium is installed and there is an
  `aiwork:agent-browser` skill. Every check on the existing branch was curl,
  so no client-side code in this feature has ever executed: the submit
  handlers, the client-side password check, the error actually rendering in
  the DOM, hydration warnings. "No hydration flicker" was asserted from
  architecture alone.
- **Test `safeRedirectPath` as shipped** — import the real export and run it
  against `//host`, `/\host`, `/\/host`, absolute URLs, `javascript:`,
  embedded control characters, non-string inputs. The previous session tested
  a retyped copy of the algorithm in a `node -e` one-liner.
- **Forge a `jn_refresh_token` cookie** (or the module's equivalent) and hit
  a page: it exercises the refresh-failure path, session clearing, and shows
  a real `Set-Cookie` with the actual flags, instead of grepping the compiled
  constant out of `.output`.
- **Prove the rate-limit window releases**, not just that it closes.
- **Run the probe suite** — `vp run directus:probe` with the tokens in §7,
  sandbox disabled, twice consecutively.
- **The manual round-trip** (ticket 06): register → logout → login → reset
  e-mail → new password → login → change password, plus checking the Czech
  rendering of the reset e-mail.

## 7. Instance state

Applied by the user on 2026-08-19: the service user and its
create-Student-only policy, its static token, `REFRESH_TOKEN_TTL=30d`,
`PASSWORD_RESET_URL_ALLOW_LIST` (confirmed live — the instance rejected a
`http://localhost:…` reset URL), and `public_registration` still off.
`NUXT_DIRECTUS_SERVICE_TOKEN` is present in the Coolify environment: the PR
preview boots, which the runtime-config schema would otherwise refuse.

Still outstanding — see `ops-checklist.md` (on the impl branch) for detail:

- The service role/policy/permissions are **not in the committed
  directus-sync dump**; needs `vp run directus:pull` with an admin token.
- Student policy permissions on `directus_users`, own row: `update`
  (`password`) is needed for the change-password flow. `read` (`id`, `email`)
  is needed **only if you do not adopt nuxt-auth-utils** (§1).
- Probe tokens: `DIRECTUS_PROBE_SERVICE_TOKEN`, `DIRECTUS_PROBE_ADMIN_TOKEN`.

## 8. Process gotchas

- **The pre-commit hook does not exist in a fresh checkout.** `core.hooksPath`
  points at the generated, self-ignored `.vite-hooks/_`, created by
  `pnpm install` → `prepare: vp config`. Commit before installing and no
  formatting or linting runs, silently. This is how unformatted markdown has
  reached master from docs-only sessions.
- **Do not use `git add -A`.** The previous session did, and a repo-wide
  `vp check --fix` run while debugging swept four unrelated files into a
  feature commit. Stage explicit paths.
- Use `git commit -F <file>`; a heredoc on stdin hung against the hook.
- **Never put a password literal in a probe**, even for a throwaway user
  the probe deletes — GitGuardian scans PR history, and once it is in a
  commit, only a force-push removes it. Generate them per run.
- Builds inside the agent sandbox need
  `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`, or `@nuxt/fonts` dies on
  `SELF_SIGNED_CERT_IN_CHAIN`.
- `vp build` does not work; use `vp run build`. `vp run verify:all` is the
  full gate.
- Nitro now refuses to boot without `NUXT_DIRECTUS_SERVICE_TOKEN`, so local
  checks need a dummy value exported.
