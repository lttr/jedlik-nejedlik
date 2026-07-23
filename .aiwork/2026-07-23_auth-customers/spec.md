# Spec — Auth / customers layer (area 02)

## Source

> ## 02 — Auth / customers layer (FP-1, O-17, TO-2)
>
> Account-first native Directus email+password auth surfaced in the `customers`
> layer: register, login, logout, password reset (Directus → Mailgun, already
> configured). Session handling for Nuxt SSR; identity = email. No magic link
> in v1.
>
> - **Depends on:** 00, 01.
> - **Verify:** full register → reset → login round-trip on staging.

Backing requirements (from `.aiwork/2026-06-09_kurzy-platforma/spec.md`):

> - FP-1: Uživatelské účty (registrace, přihlášení, obnova hesla).
> - O-17 ✅ Účet-první (account-first): zákazník se registruje / přihlásí před
>   nákupem, takže objednávka i oprávnění se vážou na známého studenta a odpadá
>   párování platby k dodatečně vzniklému účtu. Identitou je e-mail.
> - TO-2 ✅ Autentizace – vyřešeno: nativní e-mail + heslo v Directu, model
>   účet-první (registrace/přihlášení před nákupem), identitou je e-mail.
>   Bezheslové přihlášení (magic link) odloženo na později – Directus to
>   nativně neumí (jen lokální heslo a SSO), implementovalo by se v Nitro nebo
>   přes komunitní rozšíření; datový model kvůli tomu měnit netřeba.
> - TO-6 ✅ Odesílání e-mailů – využít stávající stack, žádný nový poskytovatel.
>   (…) Auth e-maily (obnova hesla; později magic link) a případné další app
>   e-maily jdou přes Directus, který už má nakonfigurovaný Mailgun.

## Summary

Add end-user identity to the site. A visitor can register (email + password),
verify their email, log in, log out, and reset a forgotten password — all
against the production Directus instance's **native** auth, with Mailgun (already
configured on Directus) sending the verification and reset emails. The logged-in
session must survive Nuxt SSR so pages render the correct auth state on first
paint and so later areas (04a checkout, 06 player) can make entitlement-scoped
Directus calls server-side.

Architecture (TR-1): Directus is the identity provider and system of record.
Nitro is a **thin trusted proxy** — it forwards credentials to Directus auth
endpoints and owns only the browser-facing session cookies. It never becomes a
second store of identity and holds no long-lived admin secret; every call is
made with the end user's own Directus tokens.

## Decisions

| Decision                    | Choice                                                                                                                                            | Rationale                                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth mechanism              | Native Directus email + password (`login`, `refresh`, `logout`, `passwordRequest`, `passwordReset`, `registerUser`) via `@directus/sdk`           | TO-2 fixes this. No custom credential handling, no password storage on our side.                                                                                                                                                       |
| Token transport to Directus | SDK `mode: "json"` — tokens returned in the response body, never Directus's own cookie                                                            | Directus runs on a different domain (`obsah-jedlika.lttr.cz`); its `session`/`cookie` mode sets a cookie the browser won't send to our origin and our SSR server can't read. `json` mode lets us own the session cookie on our domain. |
| Session cookies             | Two **httpOnly, Secure, SameSite=Lax** cookies on our origin: `d_access` (access token, maxAge = token `expires`) and `d_refresh` (refresh token) | httpOnly keeps tokens out of reachable JS (XSS-resistant). Same-origin first-party cookies dodge the cross-domain problem. Lax is right for a top-level-navigation login flow.                                                         |
| Access-vs-refresh split     | Use `d_access` on the fast path; refresh (rotating) only when it's absent/expired, rewriting both cookies                                         | Directus rotates refresh tokens, so refreshing on every request risks races on concurrent SSR+hydration loads. Caching the access token until expiry makes refresh rare and keeps rotation to ≤ once per access-token lifetime.        |
| Where auth calls live       | Nitro server routes under `/api/auth/*`; browser talks only to our origin                                                                         | Keeps the cross-domain Directus call server-side (no CORS, no client-exposed tokens), and gives one place to set/clear cookies. Matches TR-1 "thin Nitro".                                                                             |
| SSR state hydration         | App plugin resolves the user from `/api/auth/me` (via `useRequestFetch` on the server) into `useState('auth.user')`                               | First paint reflects real auth state; client reuses the SSR-resolved state without a second round-trip.                                                                                                                                |
| Registration path           | Directus **public registration** (`registerUser`) with `verification_url` → email verify → then login                                             | `[DECIDED]` Native, no admin token on our side, assigns the configured default role. Requires enabling `public_registration` on the instance (see Open prerequisites).                                                                 |
| Default role for new users  | `Student` (`_syncId 186fdb62-3231-4322-8491-2c3dd8124842`, described "přiřazováno při registraci")                                                | Area 01 created the role for exactly this. Set as `public_registration_role` on the instance.                                                                                                                                          |
| Email verification          | Keep Directus `public_registration_verify_email = true`                                                                                           | Confirms address ownership before an account is usable; matches account-first intent. Verification email routed by Directus/Mailgun (TO-6).                                                                                            |
| Layer placement             | Everything under `web/layers/customers/`                                                                                                          | Area 00 created this layer to own identity flows; keeps the marketing site and shop/lms layers decoupled.                                                                                                                              |
| Route language              | Czech paths: `/registrace`, `/prihlaseni`, `/odhlaseni`, `/zapomenute-heslo`, `/obnova-hesla`, `/ucet`                                            | Czech-locale site; matches existing routes (`/clanky`, `/pro-odborniky`).                                                                                                                                                              |
| Input validation            | `zod` schemas shared by client form and server route                                                                                              | Already the project's codec tool (schemas.ts); single source of truth, server never trusts the client.                                                                                                                                 |
| Magic link                  | Out of scope                                                                                                                                      | TO-2 defers it explicitly.                                                                                                                                                                                                             |

## Scope

**In**

- `customers` layer server utilities: session cookie helpers + a per-request
  authenticated Directus client resolved from cookies (with refresh/rotation).
- Nitro routes: `register`, `login`, `logout`, `password-request`,
  `password-reset`, `me`.
- Client `useAuth()` composable (reactive user, actions) + SSR hydration plugin.
- Czech auth pages + a minimal `/ucet` page (proves a logged-in session).
- Opt-in route middleware `auth` to gate future member pages.
- Shared zod schemas for the auth payloads.

**Out**

- Enabling `public_registration` on the Directus instance (config is pull-only;
  needs an admin — see prerequisites).
- Checkout/order flows (04a), entitlement-gated content (06) — only the session
  foundation they build on.
- Magic link, social/SSO login, profile editing beyond what proves the session,
  account deletion, styling polish beyond the site's existing components.

## Acceptance criteria

1. `POST /api/auth/register` with a fresh email+password triggers Directus
   registration and a verification email; a duplicate/invalid input returns a
   clean 4xx, never a 500 leaking Directus internals.
2. After verifying, `POST /api/auth/login` sets `d_access` + `d_refresh`
   httpOnly cookies; a wrong password returns 401 with a Czech message.
3. A logged-in user reloading any page sees logged-in state in SSR HTML (no
   flash of logged-out), driven by `/api/auth/me`.
4. `POST /api/auth/logout` revokes the refresh token at Directus and clears both
   cookies; `/ucet` then redirects to `/prihlaseni`.
5. `POST /api/auth/password-request` sends a reset email with a link to
   `/obnova-hesla?token=…`; `POST /api/auth/password-reset` with that token +
   new password succeeds and the new password logs in.
6. The `auth` route middleware redirects an anonymous visitor away from a gated
   page to `/prihlaseni` and back after login.
7. `vp run build`, `nuxi typecheck`, eslint, and fallow are all green.

## Open prerequisites (instance-side, blocker for live verify)

Config-as-code is **pull-only** and no admin `DIRECTUS_TOKEN` is available in
this session, so the following must be done on the instance by an admin before
the register → reset → login round-trip can be verified on staging. `[OPEN]`

- Set `public_registration = true`.
- Set `public_registration_role = <Student role id>`.
- Keep `public_registration_verify_email = true`.
- Confirm the Student policy's `app_access` is what we want for a logged-in
  end user (it should NOT grant admin-app access; API access is enough).
- After the change: `vp run directus:pull` to refresh the committed dump, commit
  the settings diff.

Until then the app code is complete and unit-verifiable (typecheck/build), but
the live email round-trip (criteria 1–5) is verified against staging only once
registration is enabled.
