---
status: ready
blocked_by: [01]
references:
  - "Spec: ../spec.md"
  - "ADR: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 02 — Session foundation: login, logout, sliding session

**What to build:** an existing Student logs in at `/prihlaseni`, lands on
a minimal `/muj-ucet` (their e-mail + logout), stays logged in across
reloads and SSR for up to 30 sliding days, and can log out. The header
reflects logged-in/out state. `?redirect=` (same-origin paths only) is
honored, falling back to `/muj-ucet`; a logged-in Student opening
`/prihlaseni` is forwarded onward; a guest deep-linking to a protected
page is bounced to login and returned after.

## Acceptance criteria

- [ ] Nitro routes proxy Directus login/refresh/logout; tokens live only
      in httpOnly, secure, SameSite=Lax cookies on the site domain
- [ ] Transparent server-side refresh when the access token expires — no
      visible logout, no client-side refresh logic
- [ ] Per-request authenticated Directus server client available to any
      layer's SSR/Nitro code; the anonymous client and all existing
      public-content fetching untouched
- [ ] `useStudent()` returns `{ student, loggedIn }`, identical on SSR
      and client (no hydration flicker)
- [ ] Named `auth` route middleware, opt-in per page, guards `/muj-ucet`
- [ ] Wrong credentials show a generic Czech error (no enumeration)
- [ ] An **Unverified** account (registered, link not yet clicked) gets a
      Czech "confirm your e-mail first" message if Directus distinguishes
      that case from bad credentials — otherwise the generic error, with
      the finding recorded
- [ ] `auth.probe.ts` covers login/refresh/logout round-trip and wrong
      credentials against production, self-cleaning, probe-suite
      conventions

## Rework notes

- Build the session on **nuxt-auth-utils** (per the revised spec):
  sealed cookie carries the Student's e-mail (no `readMe` per render, no
  `Accept`-header heuristic, no `readAuthenticatedStudent` guard);
  Directus access + refresh tokens go in the session's server-only area
  (verify its exact name in the module docs); transparent refresh lives
  in `sessionHooks.fetch`. New env var `NUXT_SESSION_PASSWORD`; sealed
  cookies cap at 4KB.
- Wrap the module's `user`-shaped API behind Student-named identifiers
  (GLOSSARY.md); don't leak `useUserSession()` into pages. Whether the
  e-mail in the cookie violates ADR 0001 (second store of identity vs
  cache) is the **user's call — ask, don't decide**; the spec's Further
  Notes now carries a recommendation ("cache") awaiting confirmation.
- Add a **per-IP rate limit on login** — Directus's per-user
  `auth_login_attempts: 7` does nothing against credential stuffing
  spread across many accounts, and registration and password-request are
  already limited. Known limits of the current limiter: in-memory per
  Nitro process (budgets reset on deploy, double with a second
  instance), trusts client-controlled `X-Forwarded-For`.
- If Directus is unreachable, surface an error rather than silently
  rendering every visitor as logged out.
- Page titles: auth pages set bare titles via `useHead({ title })`
  (they are `robots: false`, so no `useSeoMeta` — no point emitting
  `og:title` for unindexable pages), relying on a single
  `titleTemplate`; the repo-wide titleTemplate fix is its own commit,
  not folded into the auth work.
- Keep from the existing branch (PR #16): `useAuthForm()`,
  `authErrorMessage` (zod-parsed error body), `safeRedirectPath`
  (resolves against a throwaway origin) — which needs a real test of
  the shipped export (ticket 06).
