# Implementation notes — Auth / customers layer (area 02)

Chronological log. Newest entries at the bottom.

## 2026-08-19

- **/implement run started.** Input: the whole task folder → tickets 01–06,
  all `status: ready`. Clarity gate passed on the spec: decisions are
  settled (three grilling rounds), routes/data model/file targets named,
  testing seams fixed.
- **Access constraint raised before touching code.** Tickets 01 and 06 need
  work this session cannot do: Directus admin credentials (no `DIRECTUS_TOKEN`
  in the environment, no Directus MCP server configured — unlike area 01's
  session) and an e-mail inbox. Asked the user; answer: _"i have applied the
  content of ticket 1"_. So the instance prerequisites exist, but this session
  still has no admin token to re-pull the config dump and no service token to
  run probes against. Plan: implement tickets 02–05 in full, write the probes,
  leave every criterion that needs the instance or an inbox unchecked, and
  collect the outstanding ops steps in `ops-checklist.md`.
- **Deviation from the /implement skill: no per-ticket subagents.** The
  session's operating rules forbid spawning agents unless the user asks for
  them, so the ticket loop runs inline in this session. Same loop, same
  per-ticket commits.

### Ticket 02 — session foundation

- **Ticket 02 started** (status → in-progress).
- Goal understanding: Nitro routes proxying Directus login/refresh/logout
  with tokens confined to httpOnly cookies, a per-request authenticated
  Directus server client in the `directus` layer, `useStudent()` hydrated
  identically on SSR and client, a named `auth` route middleware, the
  `/prihlaseni` and `/muj-ucet` pages, header state, same-origin redirect
  handling, and `auth.probe.ts`.
- **Layer split judgment call.** The spec says the `directus` layer gains
  "only the generic per-request authenticated server client". Session
  _storage_ (cookie names, flags, transparent refresh) went into that layer
  too, because `getDirectusServerClient(event)` cannot build a client
  without it and the mechanics are Directus token handling, not identity
  domain logic. Everything domain-shaped — the auth routes, Czech copy,
  redirect rules, the guard — stayed in `customers`.
- **No JWT decoding.** The access cookie's `max-age` is set from the
  token's own `expires` minus a 10s margin, so "cookie present" means
  "token still valid". Expiry handling is therefore a cookie lookup, not a
  JWT parse, and there is no clock-skew branch to get wrong.
- **Refresh races.** Directus rotates the refresh token, so two concurrent
  requests arriving after expiry would spend the same token and one would
  be logged out. `refreshDirectusSession` shares a single in-flight promise
  per refresh token within the Nitro process. That covers the single-instance
  deployment we have; a multi-instance deploy would need a shared lock.
- **Identity resolution is a Nitro middleware, not an SSR `$fetch`.**
  Calling an internal `/api/auth/session` route during SSR would lose the
  `Set-Cookie` headers a transparent refresh emits (they would land on the
  inner event). The middleware runs on the real request instead, so a
  refresh during SSR reaches the browser. It is skipped for `/api/*`,
  `/_*` and anything with a file extension — otherwise every asset request
  by a logged-in Student would cost a Directus round-trip.
- **Discovered instance prerequisite (not in any ticket).** A Directus
  Student has `app_access: false` and no `directus_users` permission, so
  `/users/me` will not answer for them. `useStudent()` needs a read
  permission on `directus_users` (`id`, `email`, own row) — recorded in
  `ops-checklist.md`. `readStudent` logs loudly rather than silently
  treating the 403 as "logged out".
- **Verified in dev against the production Directus** (`nuxi dev`, port
  3210): `/prihlaseni` SSRs the form; `/muj-ucet` as a guest 302s to
  `/prihlaseni?redirect=/muj-ucet`; the header renders "Přihlásit se";
  both auth pages answer `X-Robots-Tag: noindex, nofollow`; wrong
  credentials and a malformed body both return 401 with the same Czech
  `message`; logout without a session is a 200 no-op. The positive login
  path needs a Student account with a known password — no such credential
  exists in this session, so it is covered by ticket 06's round-trip.
  `nuxi typecheck` clean, `scripts/smoke-dev.sh` HTTP 200.
