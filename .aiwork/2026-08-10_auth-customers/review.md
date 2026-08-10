# Review — Auth / customers layer (area 02)

Branch review of `c132839..HEAD` (tickets 01–03), 2026-08-10, run inline
over the whole diff: 35 files, ~1900 insertions — session plumbing, six
auth routes, six pages, unit-test infrastructure, and three tooling
changes.

Ran inline rather than as parallel review agents: this session's
instructions forbid the Agent tool unless the user asks for it.

## Findings and resolutions

| #   | Severity | Finding                                                                                                                                                                                                                                                                                               | Resolution                                                                                                                                                                                    |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | High     | Registration and password-reset links carry single-use tokens in the URL, and Sentry runs on both client and server with `sendDefaultPii: true` and `tracesSampleRate: 1.0` — every visit to a reset link would ship an account-takeover credential to sentry.io and keep it for the retention window | Fixed: `redactSensitiveParams` + `scrubSensitiveParams` wired into `beforeSend` and `beforeSendTransaction` in both Sentry configs; 11 unit tests, including that `tokenized=1` is left alone |
| 2   | High     | `getStudentToken` cleared the session whenever `/auth/refresh` threw — including when Directus was merely unreachable. A transient outage would sign out every Student at once and send them to a login that is down for the same reason                                                              | Fixed: only a refusal Directus actually reported clears the session; no error code yields 503 and the cookie is kept                                                                          |
| 3   | Medium   | Login mapped every thrown error to 401 "wrong password", so an outage told each Student their credentials were wrong — and this masked the discovery that Directus is unreachable from the agent environment                                                                                          | Fixed during ticket 02: a missing Directus error code means Directus never answered, and yields 502 "temporarily unavailable". Same treatment in registration and the reset request           |
| 4   | Medium   | `PUT /api/auth/password` answered "password must be at least 8 characters" when the _token_ was missing, sending the Student to fix something that was not wrong                                                                                                                                      | Fixed: the failing field selects the message                                                                                                                                                  |
| 5   | Low      | 24-line clone between the two anti-enumeration handlers (fallow clone detection)                                                                                                                                                                                                                      | Fixed: extracted `swallowRejection(error, subject)`                                                                                                                                           |
| 6   | Low      | `login.post.ts` exceeded the repo's cyclomatic gate of 8 (fallow: 9)                                                                                                                                                                                                                                  | Fixed: error construction extracted into `rejectedLogin` / `upstreamProblem`                                                                                                                  |

Findings 1 and 2 are the same mistake in two places — treating "the
dependency did not answer" as "the dependency said no". Worth watching for
in areas 04–05, where GoPay and Fakturoid have the identical shape.

## Clean areas

- No secrets in the diff; `web/.env` is gitignored and untracked. The one
  credential-shaped string added is the `NUXT_SESSION_PASSWORD` placeholder
  in `.env.example`.
- Directus tokens never reach the browser: they live only in the session's
  `secure` half, which `nuxt-auth-utils` strips from
  `GET /api/_auth/session` (`const { secure, ...data } = session`, read at
  source).
- Anti-enumeration holds by construction across registration, password
  request and login — one message, one status, for present and absent
  addresses alike.
- `?next=` is sanitised to same-site paths only; absolute, protocol-relative
  and backslash-smuggled URLs all fall back. Covered by tests.
- Verification and reset URLs are built from the configured site URL, never
  the request's `Host` header, since they are mailed to an address someone
  else typed.
- Layer boundaries hold: the `directus` layer gained only a Nitro client
  singleton, with all session awareness in `customers`.

## Verification

- `vp run verify:all` green on the committed state of tickets 01–03
  (oxfmt, oxlint, eslint, typecheck, fallow, smoke, build), plus the new
  `verify:test`. Re-run green after the review fixes.
- 55 unit tests.
- Behaviour observed against a dev server: session redirect, anonymous
  session payload, page rendering, every validation path, and the
  outage-vs-rejection distinction on all four Directus-facing routes.

## The gap this review cannot close

**No Directus interaction in this area has ever executed.** The host is not
in the agent environment's network egress allowlist — the marketing site's
own `/clanky` 404s here for the same reason. Everything up to the Directus
boundary is verified; nothing past it is. Ticket 04 owns the whole of it,
and its acceptance criteria were rewritten to list each unverified
behaviour, including two error-code mappings (`TOKEN_EXPIRED` /
`INVALID_TOKEN` / `INVALID_PAYLOAD`) that are documented guesses.

This also means an accuracy correction: a 401 seen during ticket 01 was
read as Directus rejecting credentials when it was this code's own
catch-all. Ticket 01's verification notes and implementation-notes record
the correction.
