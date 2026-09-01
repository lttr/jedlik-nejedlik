# Spec — Area 02: Auth layer

Decisions were settled in [grilling.md](grilling.md) (three rounds, all
answered 2026-08-19). Architecture is recorded in ADR 0002
(Nitro-mediated auth sessions). Revised 2026-08-20 after reviewing the
first implementation (PR #16): session storage now builds on
nuxt-auth-utils, and the `customers` layer is renamed `auth`. Revised
again 2026-08-28: registration switches to Directus's native public
registration with e-mail verification, reversing grilling Q7 — the
service identity is gone. Parent
scope:
[areas.md](../2026-06-09_kurzy-platforma/areas.md)
area 02 (FP-1, O-17, TO-2).

## Problem Statement

The Kurzy platform is account-first: a Student must register and log in
before buying a Course, so that Orders and Entitlements bind to a known
identity (e-mail). Today the site has no notion of a logged-in visitor at
all — no registration, no login, no session, and the Directus instance has
public registration disabled. Checkout (04a) and the course player (06)
are both blocked on this.

## Solution

The `auth` Nuxt layer gains the full identity lifecycle: a visitor
registers with e-mail + password and activates the account from a
verification e-mail; an existing
Student logs in, stays logged in across visits for up to 30 days, and can
log out; a Student who forgot their password requests a reset e-mail and
sets a new password from the e-mailed link; a logged-in Student has a
minimal account page ("Můj účet") showing their e-mail, with change
password and logout. All credentials flow through Nitro routes — the
browser never talks to Directus with credentials (ADR 0002).

## User Stories

1. As a visitor, I want to register with my e-mail and a password, so
   that I can become a Student and later buy a Course.
2. As a visitor registering, I want a clear confirmation that a
   verification e-mail is on its way, and a link in that e-mail that
   activates my account, so that I know exactly what to do next.
3. As a visitor registering, I want to provide only my e-mail and a
   password, so that registration takes seconds (name is collected later,
   at checkout).
4. As a visitor registering, I want a passive notice that registration
   implies personal-data processing, linking to the privacy policy, so
   that I know where I stand without an extra checkbox.
5. As a visitor registering, I want the same confirmation whether or not
   the address is already registered, so that accounts are not
   enumerable — the confirmation itself tells me to log in if I already
   have an account.
6. As a visitor registering with a password shorter than the instance
   policy (8 characters), I want a clear Czech error before submitting,
   so that I don't bounce off a server error.
7. As a Student, I want to log in with my e-mail and password, so that I
   can reach my account and (later) my Courses.
8. As a Student mistyping my credentials, I want a generic Czech error
   that does not reveal whether the e-mail exists, so that my account is
   not enumerable.
9. As a Student, I want to stay logged in on my device for up to 30 days
   of activity without re-entering my password, so that returning to a
   Course over weeks is frictionless.
10. As a Student, I want my session to survive page reloads and SSR
    navigation identically, so that the site never flickers between
    logged-in and logged-out states.
11. As a Student, I want to log out, so that a shared device no longer
    holds my session.
12. As a Student who forgot my password, I want to request a reset e-mail
    by entering my e-mail address, so that I can regain access.
13. As a Student requesting a reset, I want the same confirmation message
    whether or not the e-mail exists, so that accounts are not enumerable.
14. As a Student, I want the reset e-mail to link to a page on the site
    where I set a new password, so that the flow stays on
    jedlik-nejedlik.cz.
15. As a Student following an expired or already-used reset link, I want
    a clear Czech explanation and a way to request a fresh link, so that
    I'm not stuck.
16. As a Student, I want a minimal account page showing the e-mail I'm
    registered under, so that I can confirm which identity I'm using.
17. As a logged-in Student, I want to change my password from the account
    page, so that I don't need the e-mail reset flow for a routine change.
18. As a Student, I want to be sent back to the page I came from after
    logging in (e.g. the sales page I was buying from), so that the login
    detour costs nothing. Registration ends at the verification notice,
    so the return happens on the login that follows.
19. As a Student landing on login/registration with no origin, I want to
    end up on my account page, so that I always land somewhere sensible.
20. As a visitor, I want the site header to reflect my state — login
    entry point when logged out, account entry point when logged in — so
    that I always know how to reach my account.
21. As a logged-out visitor opening a protected page directly (deep
    link), I want to be redirected to login and returned to that page
    afterwards, so that bookmarks keep working.
22. As an already-logged-in Student opening the login or registration
    page, I want to be forwarded to my account (or the redirect target)
    instead of seeing the form, so that the flow never dead-ends.
23. As the operator, I want new registrations to receive exactly the
    Student role, assigned by the instance's `public_registration_role`
    setting rather than by app code, so that no code path can mint
    privileged users and no role id lives in source.
24. As the operator, I want registration to run through Directus's native
    public-registration endpoint, so that the app holds no service
    credential capable of creating users at all.
25. As the operator, I want the register route rate-limited per IP, so
    that the unauthenticated endpoint cannot be used to spam users into
    the CMS.
26. As the operator, I want Directus tokens confined to httpOnly cookies
    and server-side calls, so that XSS cannot exfiltrate a Student's
    credentials.
27. As the operator, I want login brute force bounded by Directus's
    native attempt limiting, so that no extra lockout machinery is built.
28. As a developer of areas 04a/06, I want a named auth route middleware
    and a composable exposing the logged-in Student, so that protecting a
    new page or reading identity is a one-liner.
29. As a developer, I want a per-request server-side Directus client
    bound to the Student's session, so that gated reads in any layer's
    Nitro routes and SSR inherit Directus permission enforcement (R-5).
30. As a developer, I want the anonymous Directus client and all existing
    public content fetching to remain untouched, so that the marketing
    site carries zero risk from this area.
31. As a visitor whose verification link has expired or was already used,
    I want a clear Czech explanation and a route onward (log in, or
    request a password reset), so that I'm not stranded on a dead link.

## Implementation Decisions

- **Layer ownership.** All identity UI and routes live in the `auth`
  layer — renamed from `customers` on 2026-08-20: the layer's contents
  are the identity lifecycle, not a persona, and the glossary avoids
  "customer" anyway (per the layers-scaffolding contract: a layer owns
  its whole vertical, including its Nitro routes). The `directus` layer
  gains only the generic per-request authenticated server client; no
  domain logic. `/muj-ucet` stays an account **shell** (e-mail, password
  change, logout): anything about what a Student owns or does — orders,
  entitlements, courses — comes from the owning layer (`shop`, `lms`),
  even when surfaced on the account page.
- **Session architecture (ADR 0002).** Nitro mediates all auth: login,
  logout, refresh, registration, password-reset request and completion,
  and password change. The browser never holds a Directus token and never
  calls Directus with credentials.
- **Session storage: nuxt-auth-utils** (revision, 2026-08-20 — was
  hand-rolled cookies). One sealed httpOnly, secure, SameSite=Lax session
  cookie carries the Student's e-mail in the payload and the Directus
  access + refresh tokens in the session's server-only area — never in
  the part serialised to the client. Because identity rides in the
  cookie, resolving the Student needs no Directus round-trip per render;
  transparent refresh lives in the module's session fetch hook.
  Constraints accepted: one new env var (`NUXT_SESSION_PASSWORD`), one
  new dependency, the 4KB sealed-cookie cap. The module's `user`-shaped
  API is wrapped behind Student-named identifiers per the glossary.
- **Registration** (revision, 2026-08-28 — was a Nitro route creating
  the user with a dedicated service token). Directus's native public
  registration, still proxied through Nitro per ADR 0002: the route posts
  to `POST /users/register` with a `verification_url` pointing at
  `/overeni-emailu`. The instance assigns the role from
  `public_registration_role` (Student), so no role id appears in app
  source and the app holds no credential that can create users.
  `public_registration_verify_email` is on — the new Student is
  Unverified and cannot log in until they follow the e-mailed link, which
  lands on `/overeni-emailu?token=…`; Nitro exchanges the token via
  `GET /users/register/verify-email` and forwards to `/prihlaseni`. The
  endpoint answers 204 for a fresh and an already-registered e-mail
  alike — Directus does this deliberately, to keep accounts
  unenumerable — so the page shows one uniform confirmation and cannot
  report a duplicate. No name fields, no stored consent. Per-IP rate
  limiting guards our route; no captcha in v1. Two costs accepted:
  registration now takes an inbox round-trip (it sits inside the checkout
  path, see Further Notes), and the specific duplicate-e-mail error is
  gone.
- **Login errors** are generic (invalid credentials), in Czech. The
  Unverified case is the exception worth checking: if Directus
  distinguishes it from bad credentials, surface a Czech "confirm your
  e-mail first" message instead, otherwise a Student who never clicked
  the link is stuck guessing. Verify which in the probe. Directus's
  `auth_login_attempts` (7) is the brute-force bound; no additional
  lockout logic.
- **Password reset** uses the native Directus flow: request with a
  `reset_url` pointing at the site's reset page; completion posts the
  token + new password. Both legs proxied through Nitro. Directus
  generates the token and sends the e-mail (Mailgun already configured);
  the reset token is never available to our code, which is why the e-mail
  itself stays Directus-native (ADR 0002). Default e-mail template in v1.
- **Password change** for a logged-in Student updates the current user
  through the session-bound server client (requires a Student policy
  permission to update own password field — a small area-02 addition to
  the committed Directus config).
- **Routes (permanent, Czech):** `/registrace`, `/prihlaseni`,
  `/obnova-hesla` (request form; with `?token=` it renders the
  set-new-password form), `/overeni-emailu` (consumes the registration
  verification `?token=`), `/muj-ucet`. Logout is an action, not a page.
- **Redirects.** Login and registration honor a `redirect` query param
  restricted to same-origin paths, falling back to `/muj-ucet`. Logged-in
  visitors hitting `/prihlaseni` or `/registrace` are forwarded to the
  same target. Guests hitting a protected page are sent to
  `/prihlaseni?redirect=<path>`.
- **Guard.** A named `auth` route middleware in the auth layer,
  opted into per page via page meta. It is UX only; enforcement remains
  Directus permissions plus session checks in Nitro routes (R-5).
- **Client-side identity.** A `useStudent()` composable returns
  `{ student, loggedIn }`, identical on SSR and client — it wraps
  nuxt-auth-utils' `useUserSession()`, reading the session payload; no
  whoami round-trip (revision, 2026-08-20). Glossary term is Student —
  never "user" or "account" in identifiers.
- **Server client shape.** The directus layer exposes a per-request
  factory that builds an authenticated client from the event's session
  cookie (handling transparent refresh). The existing anonymous singleton
  client and all public-content consumers are untouched.
- **Runtime config.** One new private key (`NUXT_SESSION_PASSWORD`)
  declared in the auth layer's config and validated in the existing
  runtime-config schema, per the scaffolding contract. No service token —
  every Directus call is either anonymous or bound to the Student's own
  session. The public `directusUrl` key is reused.
- **Instance changes (ops, outside the repo):** env
  `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`,
  `USER_REGISTER_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/overeni-emailu`,
  `REFRESH_TOKEN_TTL=30d`; settings `public_registration: true`,
  `public_registration_role: Student`,
  `public_registration_verify_email: true`; and the Student policy's
  own-row `update` on `directus_users` narrowed to `password`. Everything
  but the env vars is directus-sync-visible, so `vp run directus:pull`
  must show them in the committed dump — that pull is the proof the ops
  work landed.
- **Session lifetime.** Sliding: 30-day refresh TTL, default access-token
  TTL. No remember-me UI.

## Testing Decisions

- **Seams.** Two, both existing or already decided:
  1. The production Directus HTTP API — the existing probe suite seam. A
     new `auth.probe.ts` exercises the auth contract directly:
     `POST /users/register` creates exactly a Student-role, Unverified
     user; it answers 204 for a fresh and an already-registered e-mail
     alike; an Unverified user cannot log in; verify-email activates the
     account; login/refresh/logout round-trip; password policy; login
     with wrong credentials; reset request returns uniformly. Uses a
     throwaway
     Student, self-cleaning, following the conventions of the
     existing probes (support helpers, env tokens, sequential runner,
     excluded from `check:all`).
  2. The app's own HTTP surface (Nitro auth routes + rendered pages),
     covered in v1 by one documented **manual round-trip** on production:
     register → verification e-mail → activate → login → logout → login →
     reset request → e-mail link → new password → login → change password
     on the account page. This is the area's verify criterion and covers
     the two e-mail legs that cannot be automated without inbox access.
- Good tests here assert externally observable HTTP behavior (status,
  error codes, cookie presence/flags, row state in Directus as admin) —
  never internal call shapes.
- Prior art: the 61-test probe suite from area 01 (public-visibility,
  student-scoping, author probes) and its support module.
- No automated browser e2e in v1 (revisit if regressions bite).
- Probe caveats carried over from area 01: run probes with the sandbox
  disabled (Node fetch cannot reach the network inside the agent
  sandbox); the instance intermittently resets connections under rapid
  sequential requests — retry rather than concluding breakage.

## Out of Scope

- Magic link / passwordless login (deferred by TO-2).
- Re-sending a verification e-mail from the app (a Student who loses the
  link registers again — the endpoint is idempotent from their side — or
  is helped manually via the Data Studio).
- Name or any profile fields beyond e-mail + password (checkout, 04a).
- Checkout consents and Order/Entitlement writes (04a/04b), order
  history, "my courses" (06).
- Newsletter opt-in, marketing consent.
- Customizing Directus e-mail templates — both the reset and the
  verification mail (follow-up if the default Czech rendering is poor).
- Moving Directus to a jedlik-nejedlik.cz subdomain (kept possible, not
  done).
- Captcha/Turnstile on registration.
- Automated browser e2e tests.
- Account deletion / GDPR erasure tooling (manual via admin for now).
- Role-differentiated frontend (e.g. admin pages). The architecture
  already permits it — login and sessions are role-agnostic, and the
  session-bound client inherits the logged-in user's Directus
  permissions — but the session payload carries no role and the `auth`
  guard is binary. A future area adds the role (or a capability claim)
  to the session payload and a role-aware guard; registration stays
  Student-only regardless (other roles are provisioned via the Data
  Studio).

## Further Notes

- ADR 0002 records the session architecture and the reset-e-mail
  constraint; ADR 0001 fixes Directus as system of record and enforcement
  boundary — nothing in this area may become a second store of identity.
  **Resolved 2026-08-28 (user):** the e-mail in the sealed session cookie
  is a **cache**, not a second store, and ADR 0002's Consequences now
  records it. ADR 0001's
  clause is about the Nitro layer owning data ("reads/writes Directus
  with a service account and never becomes a second store of _record_"),
  and its enumerated stores are students, orders, entitlements, progress,
  attempts. A sealed cookie held by the client, never queried, never
  written back, re-derived on every login, is a cache by any reading —
  the `directus_users` row stays authoritative.
- The Student role and its own-row policies already exist and are proven
  by area 01's probes; this area adds only the own-password-update
  permission (and, if ticket 05's approach holds, a `directus_sessions`
  delete on own rows) to the Directus config dump, plus the three
  `public_registration*` settings.
- Directus setting `default_language: cs-CZ` should localize both the
  reset and the verification e-mail; verify during the manual round-trip.
- **Checkout impact (area 04a).** The platform is account-first, so with
  verification on, buying now means register → leave the site → find an
  e-mail → return → log in → pay, in the middle of the purchase. This was
  accepted knowingly on 2026-08-28 (verification is standard practice),
  but 04a should measure it before assuming it is free.
- Header state (logged in/out) touches the base app's layout — keep the
  change minimal and driven by `useStudent()`.
- Ticket 06 of area 01 (author upload folder scoping, status: ready) is
  unrelated to this area and remains open.
