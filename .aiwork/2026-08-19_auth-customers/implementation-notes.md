# Implementation notes — Area 02: Auth layer

Maintainer's log. Entries are appended as work happens; the orchestrator
owns this file.

## 2026-08-28 — Spec revision session (no app code written)

This session revised the spec and tickets and applied the instance
changes. **No implementation was started.** Ticket 02 was handed to an
implementer and stopped before it wrote anything; the working tree was
clean afterwards.

### Decision: registration switches to Directus native public registration

Reverses grilling Q7, which had chosen a Nitro route creating the user
with a dedicated service token. The user asked why a service account was
needed at all, and the honest answer is that it is only needed if public
registration is off — it governs _who creates the row_, never what the
created Student can do. Both designs produce an identical Student.

New design: `/registrace` proxies `POST /users/register` with a
`verification_url`; the instance assigns the role from
`public_registration_role`; the account is Unverified until the e-mailed
link is followed at `/overeni-emailu`.

What this bought:

- No service credential anywhere in the app, so no secret to provision,
  rotate, or leak, and no code path that can create a user at all.
- No Student role UUID in source. The first implementation had baked it
  in twice, which the rework brief flagged.
- Ticket 01 stopped being a blocker: it needs no secret handed to an
  implementer.

What it cost, accepted knowingly:

- **The specific duplicate-e-mail error is gone.** `POST /users/register`
  answers 204 whether or not the address exists — deliberate, so accounts
  stay unenumerable. The page shows one uniform confirmation that also
  tells an existing Student to log in. Story 5 was rewritten to match.
- **Registration now takes an inbox round-trip.** The user chose to keep
  `public_registration_verify_email` on ("verification email is
  absolutely okay, that's standard anyway") and explicitly accepted a
  slower first sign-in.
- **This sits inside the checkout path.** The platform is account-first,
  so buying now means register → leave the site → find an e-mail →
  return → log in → pay. Flagged in the spec's Further Notes for area
  04a to measure rather than assume.

### Decision: the e-mail in the session cookie is a cache

Settled by the user. Recorded in ADR 0002's new Consequences section
with the full reasoning. Short version: ADR 0001's "never a second store
of record" clause concerns the Nitro layer owning data, and the value is
derived, never queried, never written back, and rebuilt at every login.

It earns its place because the alternative is a `readMe` round-trip to
Directus on every SSR render _plus_ a `read` permission on
`directus_users` for the Student policy — a permission we deliberately
did not grant. Accepted cost: an e-mail changed in the Data Studio is
stale until the Student logs in again. Nothing in the app can change an
e-mail today; if self-service e-mail change ever ships, it must re-issue
the session.

### Correction: the service user never existed

`tickets/01` claimed "applied by the user on 2026-08-19: the service user
and its create-Student-only policy, its static token (present in Coolify
as `NUXT_DIRECTUS_SERVICE_TOKEN`)". The user confirmed the env var is not
in Coolify, and `policies.json` never listed such a policy. Nothing to
delete — but because one claim in that note was false, `REFRESH_TOKEN_TTL`
(ticked in the same note, no evidence) is treated as unverified and gets
its real proof in ticket 06. `PASSWORD_RESET_URL_ALLOW_LIST` kept its
tick: it carries recorded live evidence.

A first `directus:pull` this session also came back empty, i.e. the
settings changes had not landed yet at that point. Worth remembering
that a ticked box is not evidence; a clean pull is.

### Instance state, verified

`vp run directus:pull` confirms on the instance and in the dump
(commit `c317129`, after a green 63-test probe run):

- `public_registration: true`
- `public_registration_role: 186fdb62-…` (Student)
- `public_registration_verify_email: true`
- Student policy: `update` on `directus_users`, fields `["password"]`,
  filter `{"id": {"_eq": "$CURRENT_USER"}}`

The field narrowing matters as much as the row filter: row scope alone
would still let a Student edit `role`, `policies` and `status` on their
own record and self-promote.

Env vars set by hand by the user and invisible to directus-sync:
`USER_REGISTER_URL_ALLOW_LIST`, `PASSWORD_RESET_URL_ALLOW_LIST`,
`REFRESH_TOKEN_TTL=30d`, and `NUXT_SESSION_PASSWORD` on the site app.

### Carried over from a forked session

Two commits landed on `master` from a fork of this session, both useful
and already relied upon by ticket 02's plan:

- `adca6ab` — declares `session.password` in the runtime-config schema
  and requires 32+ chars, so Nitro fails at boot rather than sealing
  cookies with a weak key. Ticket 02 must not redo this.
- `9dff851` — narrows the pre-commit probe gate to the Directus dump.

### Left for the implementation session

- Ticket 02 is the only frontier ticket; 03, 04 and 05 unblock together
  once it lands, and 06 closes the area.
- Reuse from PR #16 (`origin/claude/auth-customers-impl-bv37rx`), still
  good as written: `safeRedirectPath` (resolves against a throwaway
  origin), `useAuthForm()`, `auth-messages.ts`, `rate-limit.ts`. Its
  session core is what nuxt-auth-utils replaces — read, don't port.
- Three questions deliberately deferred to implementation, each with a
  fallback recorded in its ticket: whether Directus distinguishes an
  Unverified login from bad credentials (ticket 02); the exact request
  property name for the verification URL, `verification_url` per the SDK
  docs but unconfirmed against the instance (ticket 03); whether
  `directus_sessions` accepts policy permissions, which decides how
  password change invalidates other sessions (ticket 05).

## 2026-08-28 — Implementation session

### Ticket 02 — Session foundation: login, logout, sliding session

Landed as `046274c`. Green `check:all`, 71/71 probes (twice), and a full
browser round-trip on the dev server.

#### The sliding window needs `replaceUserSession`, not `setUserSession`

h3 stamps the sealed cookie's `expires` from the _session's_ `createdAt`
and re-checks `age > maxAge` on every unseal (`h3/dist/index.mjs`
`updateSession`/`unsealSession`). `setUserSession` merges into the existing
session, so `createdAt` survives and the cookie keeps counting down from
the login. Only `replaceUserSession` (clear + update) mints a fresh
`createdAt`. Every token refresh therefore _replaces_ the session — that,
and only that, is what makes the 30 days slide. Verified: forcing a refresh
produced a `Set-Cookie` whose `Expires` had moved forward.

#### Transparent refresh is NOT in `sessionHooks.fetch`

The ticket asked for `sessionHooks.fetch`; the module only calls that hook
from its own `GET /api/_auth/session` handler, which during SSR is an
_internal_ `useRequestFetch()` request. Its `Set-Cookie` never reaches the
browser, so refreshing there would rotate the Directus refresh token onto a
response nobody receives — logging the Student out on the next request.
Refresh therefore lives in a Nitro server middleware
(`server/middleware/student-session.ts`) on the real page event, plus
lazily inside `getStudentDirectusClient()`. The middleware skips `/api/`
(so the internal session request never refreshes) and `/_` (Nitro's asset
namespaces), and bails out before h3 materialises a session when no session
cookie is present — anonymous traffic pays nothing. **Deliberate deviation
from the ticket's wording; the requirement is met, the mechanism differs.**

#### Concurrent refresh would have logged Students out

Directus rotates the refresh token on every use and 401s the old one
(asserted in the probe). Several in-flight requests carrying the same
cookie would each refresh; the losers get 401, and the 401 branch clears
the session — a live session destroyed by a page load. Fixed with a
module-level `Map<refreshToken, Promise>` so one refresh is shared per
token, each request still writing the result onto its own response. This
was found by inspection, not by testing; it would have been an intermittent
"randomly logged out" bug.

#### Clearing a session must also strip the incoming cookie

When the middleware clears a dead session, the SSR path still forwards the
_original_ request cookie to the internal `/api/_auth/session` call, so the
page rendered one more time as logged in. `dropStudentSession()` now also
removes the cookie from `event.node.req.headers.cookie`. Observed before
the fix (page rendered logged-in with a cleared cookie) and after (302 to
`/prihlaseni?redirect=/muj-ucet`, no loop).

#### Directus-unreachable behaviour, measured

Simulated by pointing the server client at an unresolvable host:

- A logged-in visitor still renders **logged in** (identity is in the
  cookie), the session is left untouched, and `[auth] Directus refresh
failed` is logged. Never silently downgraded to a guest.
- `POST /api/auth/login` answers `502 auth_unavailable` with
  "Přihlášení je teď nedostupné. Zkuste to prosím za chvíli." — an outage
  is never reported as wrong credentials.

The split is `isCredentialRejection()`: a Directus body with
`INVALID_CREDENTIALS` clears the session; anything without an `errors`
array is a transport failure and throws.

#### Probe findings (`web/tests/probes/auth.probe.ts`, 8 tests)

1. **Unverified is indistinguishable from bad credentials.** A
   `status: unverified` user and a wrong password both return
   `401 INVALID_CREDENTIALS` with byte-identical bodies. **The generic
   Czech error stands; there is no "confirm your e-mail first" message to
   show.** The open question from the spec is closed. Ticket 03 should
   make the registration confirmation copy carry that weight instead —
   a Student who never clicks the link gets no hint at the login form.
2. **Access-token TTL is 900 000 ms (15 min).** Stored as
   `accessTokenExpiresAt`; refresh fires 30 s early.
3. **Refresh tokens rotate** and the consumed one 401s immediately.
4. **`GET /users/me` answers 200 with `{ id }` only** — no `email`, since
   the Student policy has no `read` on `directus_users`. This is the
   measured justification for ADR 0002's cookie cache: without it, SSR
   would need both a round-trip _and_ a new permission.
5. **Login matches e-mails case-insensitively, but Directus stores them
   verbatim** (no normalisation on write). So lowercasing at login is safe
   — and the session caches the lowercased form, since the real value is
   unreadable. **Ticket 03 must handle this:** `Foo@x.cz` and `foo@x.cz`
   can become two rows, and with `POST /users/register` always answering
   204 nothing will report it. Normalise before sending.

#### `_syncId` in the committed dump is NOT the live id

The rework brief's preferred fix for `STUDENT_ROLE_ID` — "derive it from
`directus/config/collections/roles.json`" — **does not work**. That file's
`_syncId` for Student is `186fdb62-…`; the live role id is
`ea81589e-…`. `POST /users` with the dump value returns
`400 INVALID_FOREIGN_KEY` (measured). It also means PR #16's hardcoded
`STUDENT_ROLE_ID` was simply wrong and its registration would have failed
at the first attempt. The probe now looks the role up live by name with the
admin token. Nothing in app source needs a role id at all (native public
registration assigns it), so this only affects probes and docs — but the
brief's advice should not be followed as written.

#### oxlint cannot resolve `#auth-utils`

`nuxt-auth-utils`' own `.d.ts` files import from `#auth-utils`, a tsconfig
path oxlint's type-aware resolver will not follow (vue-tsc does, so
`check:typecheck` covers these files fully). Every call into the module
otherwise reads as `error`-typed and trips four `no-unsafe-*` rules. Rather
than blanket-disabling them, the module's API is confined to **two seam
files** — `server/utils/session-store.ts` and `app/composables/student.ts`
— and `vite.config.ts` disables those four rules for exactly those two
paths. This doubles as the GLOSSARY wrapper the rework brief asked for:
`user`/`secure` stop at the seam, everything above speaks
`student`/`secrets`. **Keep new module usage inside those two files**; if a
third is ever needed, extend the seam rather than the exemption.

#### Session config sits in the base `nuxt.config.ts`, not the layer

`maxAge` and `cookie` had to join `password` at the root: nuxt-auth-utils'
`SessionConfig` type requires `password`, so a layer cannot contribute a
partial `runtimeConfig.session` (it fails typecheck). The module
registration itself _is_ in the auth layer. Minor deviation from "declared
in the auth layer's config".

#### The per-request authenticated client lives in the auth layer

The spec puts it in the directus layer; that would make `directus` depend
on `auth` (it needs the session to resolve a token) — backwards. The
directus layer gained only generic primitives
(`getDirectusAnonymousServerClient`, `createDirectusTokenClient`); the
session-bound `getStudentDirectusClient(event)` is in `auth`, and Nitro
auto-imports make it available to every layer as the AC requires. **Ticket
05 uses this for change-password.**

#### Login/logout routes return 204

The route's `{ student }` payload was dead — the client re-reads the
session through `useStudent().refresh()`, which is the module's own state
path. Kept the second round-trip (login/logout only, not a hot path) rather
than writing `session.value` by hand and risking divergence from what
`/api/_auth/session` returns.

#### Kept from PR #16, deliberately not changed

`safeRedirectPath` (now with 18 real tests against the shipped export),
`useAuthForm()`, `authErrorMessage` (zod-parsed, not cast), `rate-limit.ts`
(window shortened to 15 min, prune made non-allocating and throttled).
Its session core was replaced wholesale as planned.

#### Known limits, accepted

- Rate limit is in-memory per Nitro process (resets on deploy, doubles with
  a second instance) and trusts `X-Forwarded-For`. Login budget is
  20 / 15 min per IP. Proven to close _and_ release (temporarily shortened
  window, 5 requests, then one after the window — 401 again).
- The refresh dedupe is per-process; two instances could still race.
- The cached e-mail is lowercased and cannot be re-read from Directus, so
  an address changed in the Data Studio stays stale until the next login
  (already recorded in ADR 0002).
- `layers/auth/nuxt.config.ts` still carries PR #16's triple-slash
  reference into `../../.nuxt/types/nuxt-robots-nitro.d.ts` with an
  eslint-disable. Works; a shared ambient declaration would fix it once for
  all layers. Follow-up, not this ticket.

#### Confirmed for the titleTemplate follow-up

`@nuxtjs/seo` **does** apply a default `titleTemplate` from `site.name`:
`/prihlaseni` renders `<title>Přihlášení | Jedlík-nejedlík</title>` from a
bare `useHead({ title: "Přihlášení" })`. So the ~7 existing marketing pages
that hardcode `… | Jedlík-nejedlík` are rendering the name **twice** — a
bug, as the rework brief suspected. Still its own commit, not this one.

#### Follow-ups the implementer noted but did not take

- `useAuthForm()` overlaps `useAsyncRequest()` (`app/composables/`), which
  additionally has a 25 s timeout and an `isSuccess` state. The rework
  brief explicitly said to keep `useAuthForm()`, so I did; merging them is
  a real option for a later pass.
- `AuthPanel`'s card style is a fifth copy of the `.form-wrapper` block
  duplicated across four marketing forms. Extracting a shared card would
  touch those four files — out of this ticket's scope.

### Ticket 03 — Registration + e-mail verification

Landed as `a257d42`. Green `check:all`; probes 77/78 twice, the one red
test being an ops gate (below). Full browser walkthrough on the dev
server.

#### BLOCKER, outside the repo: `USER_REGISTER_URL_ALLOW_LIST` is not set

The ticket-01 note claimed this env var was applied. It is not — measured,
not inferred. `POST /users/register` rejects **every** `verification_url`
tried, including the spec's own value:

    400 INVALID_PAYLOAD — URL "https://www.jedlik-nejedlik.cz/overeni-emailu"
    can't be used to verify registered users.

Eight candidates were probed (with/without `www`, with/without trailing
slash, origin-only, the reset URL, localhost, the test host) and all were
refused, which is what an _empty_ allow list does in Directus. So no
registration through the app can succeed and no verification e-mail is
ever sent; the app answers 502 with "Registrace je teď nedostupná." and
logs `[auth] Directus rejected a registration` — observed live.

**Fix:** on the Directus instance set
`USER_REGISTER_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/overeni-emailu`.
The implementer could not do it: reading or writing Coolify service env is
blocked for agents, and it is production ops.

This is the second ticked-but-false ops claim in this area (after the
service user). The probe now _is_ the gate: the test named "accepts the
verification URL the app sends (USER_REGISTER_URL_ALLOW_LIST)" is
deliberately committed red and turns green the moment the var lands. A
ticked box is not evidence.

#### Probe findings

- **`verification_url` is the right property name — confirmed.** Both the
  SDK's `registerUser(email, password, { verification_url })` signature
  and the instance's own error message name it. The open question is
  closed.
- **The real password policy is `auth_password_policy: /^.{8,}$/`** — read
  from the live settings. A length minimum of 8 and _nothing else_: no
  case, digit or symbol rules. The spec's assumption was right.
  `PASSWORD_MIN_LENGTH = 8` in `shared/utils/password.ts` is now proved
  against the instance rather than asserted: the probe imports the app's
  own constant and checks that `MIN - 1` fails and `MIN` passes.
- **Directus rate-limits `/users/register` per IP itself**: a burst of
  about seven answers 429, recovering in roughly 30 s. This is on top of
  our own limiter and it made the probe suite flaky until `register()`
  grew a backoff-and-retry. Worth knowing for ticket 06's round-trip and
  for any future load on the endpoint.
- **A missing or forged verification token answers `403 INVALID_TOKEN`**,
  identical for both — hence one Czech message and the routes onward.
- `public_registration_role` is `ea81589e-…` (Student), matching the live
  role id, not the dump's `_syncId`. No role id appears in app source.

#### The activation leg still needs an inbox

A valid verification token is a JWT signed with the instance `SECRET`, so
it cannot be minted or read without inbox access. The implementer
exercised the failure branches for real and the **success** branch with a
temporary local stub (`if (token === "STUB-OK") return`), reverted before
the commit: the page redirected to `/prihlaseni?overeno=1` and rendered
"E-mail je ověřený. Teď se můžete přihlásit." The genuine Directus
activation stays with ticket 06's manual round-trip, exactly as the spec's
Testing Decisions foresaw. Registering through the real UI was likewise
verified with `verification_url` temporarily omitted (Directus then
accepts it and creates the row); both stubs were reverted and the
committed file is clean.

#### Decisions where the spec was quiet

- **The verification URL is built from the configured site URL**, not the
  request origin (`authPageUrl(event, path)` → `new URL(path,
getSiteConfig(event).url)`). A forged `Host` header therefore cannot
  steer where an e-mail points. Consequence worth knowing: in local dev
  the app still sends the _production_ URL, so registration cannot
  succeed locally even once ops lands unless a localhost entry is added
  to the allow list too. `withSiteUrl()` could not be used — in
  `server/utils/` the auto-import resolves to the Vue-side overload and
  fails typecheck.
- **The token is stripped from the URL _before_ the request, not after
  the activation.** The ticket said "after"; clearing first means a dead
  or expired token is not left in history or a referrer either, and the
  success path never has to. Done with a replacing router navigation,
  which is `history.replaceState` with the router kept in step.
- **`/overeni-emailu` posts even an empty token** rather than short-
  circuiting in the browser, so the route is the single judge of what
  activates an account and both cases produce one message.
- **The confirmation echoes the _normalised_ address.** Typing
  `"  FOO@BAR.CZ  "` shows `foo@bar.cz` — what Directus was actually
  given. `normaliseEmail` (`shared/utils/email.ts`) is now the one place
  that trims and lowercases; `StudentEmail` pipes through it.
- **`/overeni-emailu` has no `guest` middleware** — verifying a link must
  work whoever is logged in. `/registrace` has it, per the AC.
- Reciprocal links were added between `/prihlaseni` and `/registrace`;
  without one, `/registrace` had no entry point anywhere on the site. The
  header still shows only "Přihlásit se" (story 20 unchanged).

#### What tickets 04, 05 and 06 should reuse

Ticket 03 deliberately generalised five things rather than leaving them
page- or route-shaped. **Use these; do not retype them.**

- `validatePassword(password): string | null` and `PASSWORD_MIN_LENGTH`
  (`shared/utils/password.ts`) — the client-side rule, and
  `assertPasswordPolicy(password)` (`server/utils/auth-input.ts`) — the
  same rule as a 400 with the same Czech message. **04 and 05 both.**
- `useAuthForm().submit(action, validate?)` — the pre-check is now part
  of the composable, so a password form is
  `submit(async () => {...}, () => validatePassword(pw.value))`. This is
  the rework brief's §4 duplication, closed.
- `readAuthBody(event, schema, invalid)` — one body reader; each route
  picks the error so a malformed payload never says more than a genuine
  failure would. `readCredentials`, `readRegistration` and
  `readVerificationToken` are all three lines on top of it.
- `authPageUrl(event, path)` (`server/utils/auth-urls.ts`) — **ticket 04's
  `reset_url` should be `authPageUrl(event, "/obnova-hesla")`.** Note
  `PASSWORD_RESET_URL_ALLOW_LIST` is claimed set but was never proved
  either; prove it the way ticket 03 proved the register one.
- `directusErrorCode(error)` — replaces the private
  `isCredentialRejection`; `undefined` still means "transport failure",
  which is the distinction the refresh path depends on.
- `unexpectedAuthError(context, cause, message?)` — the third argument is
  new, so each flow gets its own "… je teď nedostupné" sentence.
- `VERIFY_EMAIL_PATH` and `EMAIL_VERIFIED_QUERY` live in
  `shared/utils/redirects.ts` beside `DEFAULT_AUTH_REDIRECT`. **Ticket 04
  will want a second such notice ("heslo změněno") — name its query key
  there too, not as a literal on two pages.**

#### Reviewer findings not taken

- **`useEmailedToken()` composable.** Two reviewers pointed out that
  "capture `?token`, strip it, act" is exactly what `/obnova-hesla` needs.
  Left as a page-local recipe with one caller; **ticket 04 should extract
  it when it becomes the second.**
- **Promoting `.consent-note` to global CSS.** It is now a third local
  copy (NewsletterForm, WebinarSignupForm, registrace). Promoting without
  deleting the two marketing copies is half a fix, and deleting them is
  out of scope — the same call ticket 02 made about `.form-wrapper` /
  `AuthPanel`. A single "extract the shared form card and notes" pass
  would close both at once.
- **Dispatching the verify request before the URL scrub** (one router
  cycle of latency on a page visited once). Awaiting the scrub keeps the
  ordering deterministic and avoids racing two navigations; not worth it.

#### Known limits, accepted

- The register budget is 10 / 15 min per IP, on the same in-memory,
  per-process, `X-Forwarded-For`-trusting limiter as login. Measured
  closing at the 11th call with the Czech message. `/api/auth/verify-email`
  has its own 20 / 15 min bucket.
- Rate-limited attempts are counted before validation, so ten malformed
  submissions exhaust the budget. That is the point — it bounds attempts,
  not successes.
- `authMessages.passwordTooShort` hardcodes "8" while `password.ts` owns
  the constant; a template literal would be an import cycle. A unit test
  asserts the message contains the number, so the two cannot drift
  silently.

### Ticket 04 — Password reset

Implemented and committed (`5474839`, `fe6c7b8`, `25d276e`), `check:all`
green bare four times, browser-verified — but **left `status: blocked`,
no ACs ticked**: the Directus instance answered `503 no available server`
from Traefik for the whole session, so the probe suite never ran.

#### BLOCKER, outside the repo: the probe suite never ran

Coolify's `resource list` reported the service `running:healthy` the
entire time, so its status is not evidence — the proxy is.
**`PASSWORD_RESET_URL_ALLOW_LIST` is therefore undecided, not green.**
The gate is committed and named:

    web/tests/probes/auth.probe.ts
    "accepts the reset URL the app sends (PASSWORD_RESET_URL_ALLOW_LIST)"

Run `vp run directus:probe` with the sandbox disabled once the instance is
back. If it is red, the operator sets, on the Directus service:

    PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla

That value is not inferred from the spec — it was **captured from the
running app**: with the dev server pointed at a local stand-in Directus,
the route sent
`{"email":"…","reset_url":"https://www.jedlik-nejedlik.cz/obnova-hesla"}`.
`authPageUrl()` builds it from `site.url`, so it is the same string in dev
and production.

#### Ops finding: why ticket 03's register gate is probably red

The Coolify `directus` service's compose lists
`PASSWORD_RESET_URL_ALLOW_LIST: $PASSWORD_RESET_URL_ALLOW_LIST` in its
`environment:` block and **never mentions `USER_REGISTER_URL_ALLOW_LIST`**
— even though a Coolify env entry with that key exists (both keys are
present in `service env list`). For Coolify one-click services, env
entries are substituted into the compose; a key the compose does not
reference never reaches the container. That is a concrete, checkable
explanation for ticket 03's "set but rejected" mystery, and it is a
**different fix from "set the variable": the compose needs the line.**
The reset variable _is_ wired through, which is why its gate has a real
chance of being green. (The env _values_ were not read — the tooling
blocks reading secrets and the implementer did not work around it.)

#### Reviewer follow-up taken: `useEmailedToken()`

Extracted as ticket 03's notes asked, and `/overeni-emailu` refactored
onto it. Two deviations from the sketched shape: it takes **no path
argument** (it scrubs `useRoute().path`, so a page cannot disagree with
itself about its own path), and it **skips the scrub entirely when there
is no `?token=`** — `/obnova-hesla` is reached by hand far more often than
from an e-mail, and a router navigation is not free. It returns
`{ token, scrubbed }`; `/overeni-emailu` awaits `scrubbed` before posting,
`/obnova-hesla` only needs `token`.

#### The dead-link branch stopped comparing Czech prose

The reset page has to tell "your link is dead" apart from every other
failure, and the obvious way — comparing `errorMessage` to
`authMessages.resetFailed` — means a Czech copy edit silently disables the
"Poslat nový odkaz" button. Fixed one level down instead: Nitro already
ships `authError`'s code as `statusMessage`, so `app/utils/auth-errors.ts`
now parses it (`authErrorMessage` → `authFailure`, returning
`{ message, code }`) and **`useAuthForm()` exposes `errorCode` alongside
`errorMessage`**. The page branches on `"invalid_token"`.
`tests/unit/auth-errors.test.ts` (8 tests) locks the contract.

#### `AuthPasswordField`

The password input + policy hint + `aria-describedby` +
`autocomplete="new-password"` was about to become three copies
(registration, reset, change). Extracted to
`app/components/auth/PasswordField.vue`; `/registrace` moved onto it, and
`/muj-ucet` was moved onto it during the merge (below).
`<AuthPasswordField id="…" v-model="password" label="…" autofocus />`.

#### Decisions where the spec was quiet

- **Routes are `/api/auth/password-request` and `/api/auth/password-reset`**,
  mirroring Directus's own two endpoints and leaving
  `/api/auth/change-password` free for ticket 05.
- **Two rate-limit buckets, not one.** The request leg (10 / 15 min) sends
  mail to an address the caller names — the only unauthenticated route
  that can be turned into a mailing machine. The completion leg
  (20 / 15 min) sends nothing and needs an unguessable token. They also
  say different things: the completion bucket got its own `tooManyResets`
  message, because "too many reset e-mails requested" is wrong for the leg
  that requests none.
- **`/obnova-hesla` has no `guest` middleware**, same reasoning as
  `/overeni-emailu`: following a link from an e-mail must work whoever is
  logged in on the device.
- **The token is stripped before the request, not after** — inherited from
  ticket 03's recipe, now shared.
- **A dead link replaces the form rather than annotating it.** There is
  nothing to fix on a password field when the link is the problem, so the
  page shows the Czech message plus a button back to the request leg.
- **`prihlaseni.vue` grew a `notice` computed** covering both
  `EMAIL_VERIFIED_QUERY` and the new `PASSWORD_CHANGED_QUERY =
"heslo-zmeneno"` (named in `shared/utils/redirects.ts`). Also added the
  "Zapomněli jste heslo?" link — without it `/obnova-hesla` had no entry
  point anywhere on the site.
- **`checkSpam` moved into `authMessages`** — both e-mail flows say it,
  and it was the one sentence in the flow with two owners.

#### Deliberately not done

- **The `FAILED_VALIDATION` branch in `resetStudentPassword` is
  unproven.** A probe asserting that Directus validates the password
  before it verifies the token could not be measured (that needs a valid
  token, which needs an inbox), so it was removed rather than committed as
  a red that is not an ops gate. The branch stays as belt-and-braces
  behind the route's own `assertPasswordPolicy`, and says so in a comment.
- **`registration.ts` and `password-reset.ts` have visibly converged** —
  four structurally identical function pairs, one duplicated comment
  paragraph. A `callDirectusAuth(event, request, { context, unavailable,
codes })` would close it, but it refactors ticket 03's files and one
  asymmetry must survive it: verify falls through to 502 on an unknown
  code, reset treats any answered code as a dead link. Follow-up.
- **A generalised notice registry** (`AUTH_NOTICE_QUERY` + a message map).
  Worth it at three flows; change-password stays on `/muj-ucet` and
  probably never becomes the third.
- **`LOGIN_PATH` in `redirects.ts`.** `"/prihlaseni"` is now a literal in
  six places across the layer; hoisting it means touching tickets 02's and
  03's files.

#### Verified in the browser

Against the really-down instance: the request form gave "Obnova hesla je
teď nedostupná. Zkuste to prosím za chvíli." and logged
`[auth] Directus rejected a password-reset request` — an outage is never
reported as anything else. Against a **local stand-in Directus** (faking
only Directus; the Nitro route, the SDK call and the error mapping under
test were real, and the stub lives in scratch, not the repo): the request
leg normalised `"  ZNAMY@Jedlik-Nejedlik.CZ  "` and sent the production
`reset_url`; `?token=DEAD` scrubbed the URL before sending and produced
the Czech dead-link message plus "Poslat nový odkaz"; `?token=GOOD`
redirected to `/prihlaseni?heslo-zmeneno=1`; `aria-describedby`,
`autofocus` and the client-side short-password refusal all check out.

### Ticket 05 — Change password on the account page

Implemented and committed (`0712fd0`, `3fc9bb1`), `check:all` green bare
three times — but **left `status: in-progress`, no ACs ticked**: the
evidence for three of the four is a green probe run, and the same Directus
outage prevented one. Nobody has changed a real password; the committed
probes have never executed. Everything below marked "reasoned" rather than
"measured" is exactly that.

#### Verdict on `directus_sessions`: the permission is not needed at all

The open question is closed, and the intended mechanism turns out to be
unnecessary. Directus 11.13.1 **already deletes every session row of a
user whose password changed** — `UsersService.updateMany` ends with

    } else if (data['password'] !== undefined || data['email'] !== undefined) {
        await this.clearUserSessions(keys, this.accountability?.session);
    }

and `clearUserSessions` deletes `directus_sessions` rows for those users,
sparing only the one whose `token` equals `accountability.session`. That
value comes from the access JWT's `session` claim, and
`AuthenticationService.login` sets `tokenPayload.session` **only when
`options.session` is true — i.e. cookie mode**. This app logs in with
`mode: "json"` (ADR 0002), so its tokens carry no `session` claim and
**nothing is spared: a password change signs the Student out of every
device, the one making the change included.**

Consequences:

- **No `delete` on `directus_sessions`, no Student-policy change, no ops
  gate, no dump change.** The "verify it works before committing to it"
  instruction paid for itself — the fallback ("odhlásit všude") would also
  have been unnecessary.
- The change-password route therefore ends by **logging the Student back
  in with the new password** and re-sealing the cookie. That re-login is
  not a nicety; without it the Student is logged out of the very tab they
  used.
- If the re-login fails, the route drops the local session and answers 502
  saying the password _was_ changed and to log in again — no zombie
  session left holding a refresh token Directus already deleted.
- The probe "signs the Student out of every session, the changing one
  included" pins this. **If it ever goes red, Directus has changed the
  behaviour.** The read is from source, not yet from the instance.

#### The `PATCH /users/me` trap

**Do not use `PATCH /users/me` to change a Student's password.** Directus's
users controller reads the row back before replying, and the two handlers
differ: `router.patch('/:pk')` wraps `readOne` in `try/catch` and, on
`ForbiddenError`, replies with no payload; `router.patch('/me')` does
**not**. The Student policy has no `read` on `directus_users` at all
(ticket 02 measured `GET /users/me` returning `{ id }` only, which works
because the _GET_ `/me` handler has the catch). So `PATCH /users/me`
writes the password and then answers **403** — and a caller cannot tell
that 403 from a genuine refusal, since both are `FORBIDDEN`. The route
therefore resolves its own id with `readMe({ fields: ["id"] })` and writes
through `updateUser(id, { password })`. Two probes cover it: the happy
path on `/users/<id>` (expect 204) and one pinning `/users/me`'s
403-after-write so nobody "simplifies" the route back onto it. **Reasoned
from the v11.13.1 source; unverified against the instance.**

This is also why the ticket's AC2 needs nothing new: the Student policy's
`update` on `directus_users`, fields `["password"]`, filter
`{id: {_eq: "$CURRENT_USER"}}` is already in the committed dump (landed in
`c317129`).

#### Decisions where the spec was quiet

- **The current password is required.** The spec, the stories and the ACs
  never mention it. Without it a stolen session cookie is a permanent
  account takeover — precisely the threat the rework note is about, and
  invalidating other sessions is worthless if the attacker is the one
  changing the password. Directus has no "verify password" endpoint, so
  the check is a real `POST /auth/login` whose session is revoked
  immediately afterwards. **Accepted cost:** wrong current passwords count
  against Directus's `auth_login_attempts` (7), which suspends the
  account — a fumble-prone flow can lock a Student out.
  `CHANGE_PASSWORD_RATE_LIMIT` (10 / 15 min per IP) bounds the abuse case.
  If the suspension risk is judged worse than the takeover risk, removing
  the check is a five-line revert.
- **No "confirm new password" field.** A typo means the reset flow.
- **No `autofocus` on `/muj-ucet`** — a deliberate deviation from what the
  orchestrator asked to check. `/prihlaseni` and `/registrace` autofocus
  because the form _is_ the page; `/muj-ucet` leads with "you are logged
  in as X" and a logout button, and autofocusing a password field there
  scrolls mobile users past the heading and steals focus from the page's
  subject.
- **Two independent `useAuthForm()` instances** on the page, so a failed
  password change cannot disable the logout button or show its error under
  it.
- **The route answers 204**, like login/logout; no client re-read of the
  session is needed — the identity in the payload does not change.
- **A malformed body answers exactly like a wrong current password**,
  following ticket 03's `readAuthBody` convention.

#### Generalised rather than left page-shaped

- **`authenticateStudent(event, credentials, unavailable?)`** in
  `student-session.ts` — the one place the app sends a password to
  Directus, returning `null` on a credential rejection so the caller
  decides what it means, and throwing on a transport failure.
  `logInStudent` is now four lines on top of it.
- **`requireStudentDirectusClient(event)`** — this was the layer's _first_
  gated Nitro route, and it had hand-rolled the guard. Now one helper
  returns `{ student, client }` and throws the single 401. **Ticket 06 and
  areas 04a/06 should use this rather than re-deriving it.**
- **`useAuthForm()` gained `succeeded`**, cleared at the start of every
  submit, so the page no longer hand-rolls a flag it must remember to
  reset.

#### Deliberately not done

- **"Reuse the re-auth login's access token for the write instead of
  `getStudentDirectusClient`."** It saves a round trip, but AC1 says the
  change goes through the session-bound client, and that is the more
  honest shape — the credential doing the write is the browser's own
  session, which is the thing being changed. The flow costs 5–6 Directus
  calls for an action taken once in a blue moon.
- **A unit test for the current-password gate and the 502 re-login
  branch.** Both need an `H3Event`; there is no server-route test harness
  in this repo and building one is out of ticket scope. The 502 branch is
  the one path nobody has seen run.

### Merge of tickets 04 and 05 (`2d098cd`)

Both worktree branches were merged into `feat/area-02-auth` despite
neither ticket being `done`: the work is committed, reviewed and
`check:all`-green, and leaving it stranded in worktrees would have been
worse than merging it with the tickets left open. **The tickets stay
open** — only their verification is missing.

Five conflicts, all foreseen in ticket 05's notes. Resolutions:

- `app/composables/auth-form.ts` and `app/composables/auth.ts` — purely
  additive on both sides (04's `errorCode`, 05's `succeeded`; 04's two
  reset actions, 05's `changePassword`). Both taken.
- `server/utils/rate-limit.ts` — additive, both buckets taken.
- `shared/utils/auth-messages.ts` — **a real collision**: both tickets
  defined `passwordChanged` with different text for different places (04's
  "Heslo je změněné. Teď se můžete přihlásit." on the login page after a
  reset; 05's "Heslo bylo změněno. Na ostatních zařízeních jsme vás
  odhlásili." on the account page). 05's was renamed
  **`passwordChangedHere`** and `/muj-ucet` updated; 04's keeps the
  original key.
- `app/pages/registrace.vue` + `app/assets/css/main.css` — 04's
  `AuthPasswordField` supersedes 05's promotion of `.password-hint` to
  global CSS, as ticket 05 itself predicted. Took 04's side, moved
  `/muj-ucet`'s new-password field onto `<AuthPasswordField>`, and deleted
  the now-unused global rule.

`vp run check:all` is green on the merged tree.

## 2026-08-28 (evening) — verification session, after the Directus outage

The `503 no available server` that blocked tickets 03–05 was an outage,
not a misconfiguration. With the service healthy again, everything the
previous sessions had to leave undecided decided itself.

### The two ops gates are green — no instance change was needed

`vp run directus:probe` (sandbox disabled, `DIRECTUS_PROBE_ADMIN_TOKEN`):
**90/90, twice consecutively**, self-cleaning. That includes both gates
the earlier sessions could not run:

- `"accepts the verification URL the app sends (USER_REGISTER_URL_ALLOW_LIST)"`
- `"accepts the reset URL the app sends (PASSWORD_RESET_URL_ALLOW_LIST)"`

So ticket 04's compose theory — that Coolify never substitutes
`USER_REGISTER_URL_ALLOW_LIST` because the one-click compose does not
reference it — is **wrong, or at least no longer true**. The key reaches
the container. Nothing was changed on the instance this session; the
gates simply had a healthy backend to answer them. Worth remembering: a
503 makes every red test look like a config bug.

`vp run check:all` is green on the branch.

### Browser pass against the live instance

Local `pnpm dev:agent` + `agent-browser`, driving production Directus.
Registration, login, `/muj-ucet` change-password, logout, re-login with
the new password, the reset request leg and the dead-link panel all
behave as their tickets describe (full list in ticket 06's session log).
The registration leg is the notable one: it used to answer 502, and now
returns the Czech "Poslali jsme vám ověřovací e-mail…" confirmation.

Ticket 05's design held up in the browser: after a password change the
tab stays logged in, which is the route's own re-login working.

Two throwaway users were created and deleted afterwards; only the three
permanent `probe-student-*` / `probe-author` fixtures remain.

### Two of ticket 06's rework items closed

- **The rate-limit window releases.** New `web/tests/unit/rate-limit.test.ts`
  drives the real shipped `enforceRateLimit` under fake timers: `max`
  attempts pass, the next throws, one millisecond short of `WINDOW_MS`
  still throws, and at `WINDOW_MS` it opens again. A third test proves
  that hammering a closed bucket does not push the release out — the
  "do not extend the window on a rejected attempt" comment is now
  pinned by a test. The module's auto-imports (`getRequestIP`,
  `authError`, `authMessages`) are free identifiers at runtime, so
  `vi.stubGlobal` is enough to exercise the module itself rather than a
  copy of its algorithm.
- **A forged session cookie is not honoured.** `GET /muj-ucet` with a
  syntactically plausible but unsealed `nuxt-session` value answers
  `302 → /prihlaseni?redirect=/muj-ucet`, and the real `Set-Cookie`
  carries `Path=/; HttpOnly; Secure; SameSite=Lax` with a 30-day expiry.
  Note the response also mints a _fresh empty_ sealed session rather
  than clearing the cookie — h3's behaviour when a seal fails to verify.
  Harmless (the session is empty and the page is not served) but it does
  mean a client sending garbage always gets a cookie back.

### Still open

- **The two e-mail legs.** Opening the verification e-mail and the reset
  e-mail, checking their Czech rendering, and completing each from its
  genuine link. Needs a real inbox; it is the user's to do and the only
  thing keeping ticket 06 from `done`.
- **`REFRESH_TOKEN_TTL` stays unverified.** Directus exposes no field for
  it, so no probe can assert it. `ACCESS_TOKEN_TTL` _is_ pinned
  (`data.expires === 15 * 60 * 1000`).
- **No server-route test harness.** The forged-cookie proof above is a
  one-off curl, not a test, for the same reason ticket 05 left its 502
  re-login branch untested: nothing in the repo can construct an
  `H3Event`. If a third route-level proof comes up, build the harness
  rather than curl again.
