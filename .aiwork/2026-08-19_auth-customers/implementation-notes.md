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

### Ticket 03 — registration

- **Ticket 03 started** (status → in-progress).
- Goal understanding: `/registrace` takes e-mail + password only, creates the
  Directus user through the ticket-01 service token with the Student role,
  logs the new Student straight in, honours `?redirect=`, and is rate-limited
  per IP. Czech errors for a duplicate e-mail and a too-short password, the
  latter also client-side. A passive privacy-policy line, no checkbox.
- **Runtime config.** The service token is the private key
  `directusServiceToken` (env `NUXT_DIRECTUS_SERVICE_TOKEN`), declared in the
  customers layer's `nuxt.config.ts` and validated by
  `web/server/runtime-config.schema.ts` — Nitro now refuses to boot without
  it, matching how `directusUrl` behaves. No hand-written `RuntimeConfig`
  augmentation: Nuxt already generates the key's type from the layer config,
  and adding one conflicts (TS2430). Only the branded public keys need the
  by-hand augmentation the module's README describes.
- **Validation runs before the rate limit.** The first cut counted every
  request, so two form typos ate 40% of a Student's hourly budget. A
  malformed payload never reaches Directus and now costs nothing; the limit
  (5/hour/IP) guards actual creation attempts.
- **Role is pinned twice**: `STUDENT_ROLE_ID` in the route and the service
  user's policy on the instance. Either alone would do; together a bug in
  one cannot mint a privileged user.
- Verified against the dev server (port 3211, dummy service token — the real
  one is not available in this session): `/registrace` SSRs with the privacy
  note and the password hint; short password → 400 "Heslo musí mít alespoň 8
  znaků."; malformed e-mail → 400 "Zadejte prosím platnou e-mailovou
  adresu."; five real attempts pass, the sixth → 429 with the Czech message;
  `?redirect=` survives the login↔registration cross-links. `nuxi typecheck`
  and `vp lint` clean.

### Ticket 04 — password reset

- **Ticket 04 started** (status → in-progress).
- Goal understanding: `/obnova-hesla` is one page in two states — a request
  form, and with `?token=` a set-new-password form. Both legs go through
  Nitro; the request leg answers identically whatever the e-mail; an
  expired or spent token gets a Czech message and a way to ask again.
- **Reset URL comes from the request origin**, not from config, so the link
  always points back at the host the Student is actually on. Host-header
  spoofing is not a hole here: Directus's `PASSWORD_RESET_URL_ALLOW_LIST` is
  the thing that decides, and it holds exactly the production URL.
  Confirmed live — a dev-server request produced _"URL
  http://localhost:3211/obnova-hesla can't be used to reset passwords"_ from
  the instance, which doubles as proof that ticket 01's env var is in place.
  The practical cost is that the reset flow cannot be exercised from dev.
- **Small addition beyond the spec: the request leg is rate-limited too.**
  An unauthenticated endpoint that makes Directus send mail is a way to
  bomb a stranger's inbox. The register-only limiter became
  `enforceRateLimit(event, limit)` with a named bucket per flow, so the two
  budgets stay separate.
- **Uniformity is total, not just in wording**: a valid unknown e-mail, a
  real one and a malformed one all return the same 200 body. Directus errors
  are swallowed into that same answer (and logged server-side).
- Verified against the dev server: both page states render; all three input
  classes return byte-identical responses; a token Directus never issued
  returns 400 with the Czech expired/used message. `nuxi typecheck` and
  `vp lint` clean.

### Ticket 05 — change password

- **Ticket 05 started** (status → in-progress).
- Goal understanding: a logged-in Student changes their password from
  `/muj-ucet` without the e-mail flow, through the session-bound client, and
  stays logged in.
- **No current-password field**, per spec. The route is protected by an
  httpOnly `SameSite=Lax` session cookie, which browsers do not attach to a
  cross-site POST, so CSRF is covered without one. Worth revisiting if the
  cookie policy ever loosens.
- **Session survives the change**: Directus does not revoke refresh tokens
  on a password update, so nothing needs re-issuing.
- **Its probes use their own throwaway pair.** Changing a password inside
  the shared fixture would break every later test that logs in with it, so
  the owner/bystander users are created in that describe's own `beforeAll`.
- **Blocked on an instance permission** (Student policy, `update`
  `directus_users.password`, own row) — recorded in `ops-checklist.md`. The
  route is written and its unauthenticated path verified (401 "Nejste
  přihlášeni."); the successful path cannot run until the permission exists.

### Wrap-up

- **Ticket 06 not started.** Its whole content is the production round-trip
  (needs a deploy plus an inbox) and two consecutive green probe runs (needs
  the tokens in `ops-checklist.md`). It stays `status: ready`.
- `vp run verify:all` green (check, eslint, typecheck, fallow, smoke,
  build). The build needs `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`
  inside the agent sandbox — `@nuxt/fonts` fetches Google Fonts through the
  proxy and otherwise dies on `SELF_SIGNED_CERT_IN_CHAIN`.
- Simplify pass: fallow flagged 7 duplicated lines between the login and
  registration submit handlers. Extracted `useAuthForm()` and rewrote all
  four auth pages against it; duplication now zero.
- Review: four findings, all fixed — see `review.md`. Accepted limitations
  (X-Forwarded-For spoofing, per-process limiter, no current-password field,
  one bounced probe e-mail) are recorded there too.
- **Left open**: ticket 01's config-dump refresh, the two Student-policy
  permissions, the service-token env var, the probe run, and ticket 06 — all
  in `ops-checklist.md`.

- 2026-08-19: GitGuardian flagged two hardcoded throwaway passwords in
  `auth.probe.ts` on the PR. Fair catch — a password literal has no business
  in the repo even when it belongs to a user the probe deletes. Both are now
  generated per run from the run stamp plus randomness, which also makes runs
  independent of each other's leftovers.
- 2026-08-19: the Coolify preview for PR #16 built and started, which means
  `NUXT_DIRECTUS_SERVICE_TOKEN` is already present in that environment — the
  boot-time schema would otherwise have refused. The preview URL itself
  answers Cloudflare 526 (origin certificate not yet issued for
  `test-16.jedlik-nejedlik.cz`), so nothing could be checked over HTTP yet.

- 2026-08-20: GitGuardian stays red on PR #16 even after the fix — it scans
  every commit in the pull request, and the two literals are still in the
  history of 79f5e48 and c880ab1. Decision (user): dismiss incidents
  36365004 / 36365005 in the GitGuardian dashboard rather than rewrite and
  force-push the branch. Nothing to revoke — the passwords belonged to
  throwaway Students the probe deletes, and the current code generates them
  per run.
- 2026-08-20: merged `origin/master` into the branch (master had moved on and
  now carries the previously-unmerged area-01 commits). One conflict, in
  ticket 01: the user's checkbox judgment on master is the accurate one — the
  service-user and static-token criteria stay unchecked because the dump
  refresh and the local-dev side are not done — so master's block was kept
  verbatim and the "Outstanding" section reworded to agree with it. The
  earlier commit that ticked five boxes over-claimed. `vp run verify:all`
  green on the merged tree.
- 2026-08-20: the committed permissions dump still has no `directus_users`
  entries for the Student policy, so ops item 2 is still open (or applied on
  the instance and not yet pulled).
- 2026-08-20: `https://test-16.jedlik-nejedlik.cz` has answered Cloudflare
  526 (origin certificate not issued) since the preview first went up, so
  none of the deployed pages have been checked over HTTP.
