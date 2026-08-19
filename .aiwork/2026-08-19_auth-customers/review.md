# Review — Auth / customers layer (area 02)

Date: 2026-08-19. Range reviewed: `8c08d65..HEAD` — 4 commits, 43 files,
~1650 insertions. Tickets 02–05 (ticket 01 was applied on the instance by
the user; ticket 06 is untouched).

## Checks

`vp run verify:all` exits 0: `vp check`, eslint, `nuxi typecheck`, fallow,
`scripts/smoke-dev.sh` (HTTP 200) and `nuxi build` all green.

Two environment notes, neither caused by this change:

- The first build run failed inside `@nuxt/fonts` with
  `SELF_SIGNED_CERT_IN_CHAIN` — the agent sandbox's HTTPS proxy. Re-running
  with `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` builds clean.
- Nitro now refuses to boot without `NUXT_DIRECTUS_SERVICE_TOKEN`, so every
  local check ran with a dummy value. That refusal was itself verified:
  starting `.output/server/index.mjs` without the variable dies with
  `Runtime config validation failed: directusServiceToken:
NUXT_DIRECTUS_SERVICE_TOKEN is missing`.

The Directus probe suite (`vp run directus:probe`) was **not run** — it needs
the service and admin tokens listed in `ops-checklist.md` §4. Running it
twice consecutively is ticket 06's criterion.

## Findings and fixes

Four findings from the review pass over the whole branch; all four fixed.

1. **Duplicated submit handling across the four auth pages** (fallow flagged
   7 identical lines in two of them). Extracted `useAuthForm()` — pending
   flag, error clearing, Czech error extraction — and rewrote all four pages
   against it. Fallow now reports no duplication.
2. **Open-redirect check enumerated escapes by hand.** `safeRedirectPath`
   rejected `//host` and `/\host` by prefix. Replaced with resolution
   against a throwaway origin: anything that changes the origin is refused,
   which the URL parser gets right for every variant (`//`, `\`, mixed,
   embedded control characters, absolute URLs, `javascript:`) without us
   listing them. Verified against that table in Node.
3. **Page detection sniffed for a file extension.** The Nitro middleware
   that resolves the Student skipped any path ending in `.<word>`, so a
   future article slug containing a dot would have rendered logged-out for a
   logged-in Student. Now it keys off the `Accept` header carrying
   `text/html`, which is what actually distinguishes a navigation from an
   asset fetch. Consequence worth knowing: a non-browser client (curl with
   `Accept: */*`) renders as logged out even with a valid session cookie.
4. **A null Student after a successful login was answered with 200.** If
   Directus refuses `/users/me` — which it does until the Student policy gets
   its read permission — the login route returned `{ student: null }`, the
   browser navigated to `/muj-ucet`, and the `auth` middleware bounced it
   straight back to the login form. Now `readAuthenticatedStudent` turns that
   into a 502 with the generic Czech message and a server-side log, so a
   misconfigured instance reads as an error instead of a redirect loop.

## Accepted limitations

Left unfixed on purpose; each is recorded here rather than in code churn.

- **The rate limit trusts `X-Forwarded-For`.** `getRequestIP(event,
{ xForwardedFor: true })` takes the client-supplied first entry, so an
  attacker who varies that header gets a fresh budget. The alternative —
  the socket address — is the reverse proxy's for every visitor and would
  rate-limit the whole site as one client. Fixing it properly means teaching
  the app which proxy hop to trust, which is more instance configuration
  than this area should carry. It still stops the accidental and the lazy
  case, which is what the spec asked for.
- **The limiter is per Nitro process and in memory.** One instance today;
  a second one would double every budget.
- **Password change asks for the session, not the current password.** Per
  spec. CSRF is covered by the `SameSite=Lax` httpOnly cookie, which
  browsers do not attach to a cross-site POST.
- **The reset-request probe sends one real e-mail per run** to a mailbox
  that does not exist on our own domain. Asserting that the request leg is
  uniform is worth one bounce; the alternative is not asserting it.

## What this branch cannot prove

The positive session path — log in, stay logged in, refresh, change a
password — needs either a Student account with a known password or the
service token, and this session had neither. Everything around it is
verified against the live instance: wrong credentials, malformed payloads,
the uniform reset response, a reset token Directus never issued, the guard
redirect, the noindex headers, and the compiled cookie flags
(`httpOnly: true, secure: true, sameSite: "lax"` in `.output`). The rest is
ticket 06's round-trip, which needs the instance work in
`ops-checklist.md` first.
