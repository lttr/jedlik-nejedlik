# Implementation notes — Auth / customers layer (area 02)

## 2026-07-23

Built the account-first auth foundation in `web/layers/customers/`, against the
production Directus instance's **native** email+password auth. Nitro stays a
thin proxy (TR-1): it forwards credentials to Directus and owns only the
browser-facing session cookies — no admin secret, no second identity store.

### What landed

- **Shared codecs** (`shared/utils/auth.ts`): zod schemas for login / register /
  password-request / password-reset, shared by client forms and server routes;
  `SessionUser` interface. Password floor `min(8)` mirrors the instance's
  `auth_password_policy`.
- **Server session util** (`server/utils/directus-auth.ts`): two httpOnly,
  Secure (prod), SameSite=Lax cookies on our origin — `d_access` (fast path,
  maxAge = token `expires`) and `d_refresh` (7-day cap). `resolveAccessToken`
  refreshes + rotates only when the access token is gone. `getAuthedClient`
  yields a per-request token-bearing SDK client. Helpers renamed to
  `setAuthCookies`/`clearAuthCookies` to avoid shadowing h3's auto-imported
  `clearSession`.
- **Nitro routes** (`server/api/auth/*`): `register`, `login`, `logout`,
  `password-request` (always 204 — no account enumeration), `password-reset`,
  `me`. Directus `mode: "json"` throughout (its own cookie sits on a different
  domain and can't reach us).
- **Client**: `useAuth()` composable + `useAuthUser()` state; a universal plugin
  resolves the session once during SSR via `/api/auth/me` (no logged-out flash);
  opt-in `auth` route middleware; `authErrorMessage` util pulling the Czech
  message off failed `$fetch`es.
- **Pages** (Czech): `/prihlaseni`, `/registrace`, `/zapomenute-heslo`,
  `/obnova-hesla`, `/odhlaseni`, `/ucet` (middleware-gated, proves the session).
- **Nav**: one auth-aware entry in `MainNav` — "Přihlášení" / "Můj účet".

### Verification

- `nuxi typecheck` ✓, `eslint .` ✓ (curly-brace autofix applied), `nuxi build` ✓
  (all six routes + pages compiled), `fallow` ✓ (0 above threshold; fallow's
  existing `web/layers/*/**` entry globs already cover the new files).
- **Live staging round-trip NOT run** — see prerequisites below.

### Open / prerequisites (blocker for live verify)

Config-as-code is pull-only and no admin `DIRECTUS_TOKEN` was available this
session, so these are instance-side, done by an admin:

- Enable `public_registration = true`; set `public_registration_role` = the
  **Student** role (`_syncId 186fdb62-3231-4322-8491-2c3dd8124842`); keep
  `public_registration_verify_email = true`. Then `vp run directus:pull` and
  commit the settings diff.
- **Confirm on staging** how Directus builds the verification link with our
  `verification_url` (`/prihlaseni?verified=1`). We rely on Directus's built-in
  verification (its email link hits Directus's verify endpoint, then lands the
  user on our page). If a given Directus version instead expects the target page
  to call `registerUserVerify(token)`, add a tiny `/registrace/overeni` page +
  `register-verify` route — a localized addition, no redesign.
- Verify a logged-in end user gets Directus **API** access without admin-app
  access under the Student policy.

Once registration is enabled, run the full register → verify → login → reset →
login round-trip on staging (acceptance criteria 1–5).
