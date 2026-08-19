# Grilling — Area 02: Auth / customers layer

Reply inline under each **Answer:** line. "OK" = accept the recommendation.

Facts already settled (not questions): Directus registration is off
(`public_registration: false`, no default role), Student role exists
(API-only, `app_access: false`), Mailgun is configured on the instance,
`PASSWORD_RESET_URL_ALLOW_LIST` must be added to the instance env, and
Directus lives on `obsah-jedlika.lttr.cz` — a different registrable domain
than the site, so its session cookies would be third-party in browsers.

---

## Q1 — Pages in scope for v1

Beyond register / login / logout / password reset, what does the
`customers` layer ship?

- (a) nothing else — header shows logged-in state, no account page
- (b) minimal account page: e-mail, change password, logout. Landing spot
  after login.
- (c) fuller account area (name editing, order-history placeholder)

Recommended: (b). Checkout (04a) and "my courses" (06) need somewhere to
send a logged-in user. Order history belongs to 04a, courses to 06.

**Answer:**
OK

## Q2 — E-mail verification at registration

- (a) none in v1 — register → logged in immediately
- (b) require e-mail verification before the account is active

Recommended: (a). A typo'd e-mail hurts only the typo-er, and verification
adds friction before purchase, which account-first (O-17) tries to
minimize.

**Answer:**
OK

## Q3 — Data collected at registration

- (a) e-mail + password only, name collected later at checkout (04a)
- (b) also first/last name now

Recommended: (a). Name is a checkout concern, Fakturoid needs it only in
area 05, and the Directus user row has the fields ready either way.

**Answer:**
OK

## Q4 — Consent at registration

- (a) passive line "registrací souhlasíte se zpracováním osobních údajů"
  linking to the GDPR page, nothing stored
- (b) stored consent record at registration too
- (c) also a newsletter opt-in checkbox

Recommended: (a). Account data processing is contractual necessity under
GDPR, no checkbox needed. Checkout consents stay in 04a.

**Answer:**
OK

## Q5 — Czech route names

Proposed: `/registrace`, `/prihlaseni`, `/obnova-hesla` (request) and
`/obnova-hesla?token=…` (set new password from the e-mailed link), account
page `/ucet`. These become permanent — the reset URL is baked into Directus
config and e-mails.

Glossary note: canonical term is Student, "účet" is on the avoid list — if
you want the language clean end-to-end, `/muj-profil` instead of `/ucet`.

**Answer:**
/muj-ucet seems appropriate

## Q6 — Redirect after login/registration

- (a) always the account page
- (b) back where the user came from (`?redirect=`, same-origin paths only),
  falling back to the account page

Recommended: (b). Checkout's "log in to buy" hop (04a) needs it anyway.

**Answer:**
OK

## Q7 — Registration mechanism

- (a) enable Directus `public_registration` with role Student — zero code,
  rigid flow, generic errors
- (b) Nitro route creating the user via a dedicated service token — Czech
  error messages, full control, public endpoint stays off. Token gets a
  minimal "create Student users only" policy, not admin.

Recommended: (b). We need Nitro auth routes anyway (Q8).

**Answer:**
OK

## Q8 — Session architecture

- (a) Nitro-mediated: Nitro proxies `/auth/login|refresh|logout`, Directus
  access+refresh tokens live in `httpOnly` cookies on our domain, refresh
  happens transparently server-side. Browser never talks to Directus with
  credentials.
- (b) move Directus to `cms.jedlik-nejedlik.cz` and use native Directus
  session cookies with `SESSION_COOKIE_DOMAIN=.jedlik-nejedlik.cz` — less
  code, but a DNS/hosting migration touching every existing asset URL.

Recommended: (a). Standard Nuxt-SSR + headless-Directus shape, no
migration, keeps (b) possible later.

**Answer:**
OK

## Q9 — Where authenticated reads happen

The per-request client shape the scaffolding spec deferred to area 02:

- (a) server-only credentials: gated Directus reads go through SSR/Nitro,
  the browser never holds a token. Public content keeps the existing
  anonymous client. Concretely: `getDirectusServerClient(event)` in
  `layers/directus/server/utils/`, built per request from the cookie.
- (b) expose the access token client-side so the browser queries Directus
  directly — less proxying, but XSS-stealable and every consumer handles
  refresh.

Recommended: (a). Matches areas 06/08, which already plan Nitro endpoints
for gated material.

**Answer:**
OK

## Q10 — Password reset flow

Native Directus flow: `/auth/password/request` with `reset_url` pointing at
our reset page, then `/auth/password/reset` with the token. Requires adding
`PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`
to the Directus instance env (ops step outside this repo).

Sub-decision: default Directus e-mail template (localized via
`default_language: cs-CZ`) or customized Liquid templates on the instance?

Recommended: native flow, default template for v1 — check the Czech
rendering during the staging round-trip, customize only if embarrassing.

**Answer:**
why not custom in nuxt? other parts are custom anyway and nuxt can call directus
behind the scenes. Or is this in any way a problem?

---

## Round 3 (settled in chat, 2026-08-19)

- **Q10 follow-up** — custom reset e-mails from Nuxt are not feasible:
  Directus never exposes the reset token to API callers, it sends the
  e-mail itself. Native flow stays; Liquid template override on the
  instance is the cheap follow-up if the default e-mail looks bad.
- **Q11 — route guard**: (a) named `auth` middleware in the customers
  layer, opt-in per page via `definePageMeta`; guests →
  `/prihlaseni?redirect=<path>`. UX only — real enforcement is Directus
  permissions + Nitro session checks.
- **Q12 — session lifetime**: (b) sliding session, refresh TTL raised to
  30 days on the instance (`REFRESH_TOKEN_TTL=30d`). No remember-me UI.
- **Q13 — registration abuse**: (b) simple per-IP rate limit in the Nitro
  register route. No captcha in v1.
- **Q14 — verification**: (a) `auth.probe.ts` against production Directus
  `/auth/*` with a self-cleaning throwaway user + one documented manual
  UI round-trip for the e-mail leg. No automated e2e in v1.
- **Composable name**: `useStudent()` returning `{ student, loggedIn }`,
  SSR-hydrated from the session.

## Ops checklist (instance changes outside this repo)

- `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`
- `REFRESH_TOKEN_TTL=30d`
- Service user + policy "create Student users only" + static token for
  Nitro (private runtime-config key).
