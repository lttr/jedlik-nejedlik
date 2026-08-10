---
references:
  - "Parent: ../2026-06-09_kurzy-platforma/implementation-areas.md (area 02, FP-1, O-17, TO-2)"
  - "PRD: ../2026-06-09_kurzy-platforma/spec.md"
  - "Depends on: ../2026-07-20_layers-scaffolding/spec.md (area 00), ../2026-07-22_directus-data-model/spec.md (area 01)"
---

# Spec — Auth / customers layer (area 02)

Native Directus e-mail + password identity surfaced in the `customers`
layer: registration with e-mail verification, login, logout, password
reset, and an SSR-safe session that later areas (`shop` checkout, `lms`
player) read to know who the Student is. Account-first (O-17): identity is
the e-mail, and a Student exists before any Order.

This area also settles the two questions area 00 deferred: the shape of
the per-request authenticated Directus client, and where a layer's runtime
config keys live.

## Decisions

### 1. Session: `nuxt-auth-utils`, tokens in the server-only half

`nuxt-auth-utils` 0.5.30 is added to `web/` and registered in
`layers/customers/nuxt.config.ts` — the layer that owns identity owns the
module. It seals a session into an httpOnly cookie on **our** domain and
splits it into a client-readable half (`user`) and a server-only half
(`secure`), which is exactly the split we need:

```ts
// #auth-utils augmentation — layers/customers/shared/types/auth.d.ts
interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}
interface SecureSessionData {
  accessToken: string
  refreshToken: string
  // Absolute expiry (epoch ms) computed from Directus's `expires` (ms TTL).
  expiresAt: number
}
```

Directus tokens never reach the browser. The cookie is `sameSite: "lax"`,
httpOnly, `secure` in production, `maxAge` 30 days — matched to Directus's
refresh-token TTL so a returning Student stays logged in.

**Why not Directus's own cookie mode:** Directus runs on
`obsah-jedlika.lttr.cz`, the site on `www.jedlik-nejedlik.cz`. A shared
auth cookie would have to be `SameSite=None; Secure` cross-site, which
puts the refresh token in the browser and breaks under third-party-cookie
blocking. Every Directus auth call is proxied through Nitro instead.

The module ships `GET`/`DELETE /api/_auth/session` and the
`useUserSession()` composable; we do not re-implement them.

### 2. Authenticated Directus access: `withToken`, not a second client

Area 00 left "per-request authenticated Directus client (area 02 decides
its shape)". Decision: **there is no per-request client.** The `directus`
layer keeps its single pure factory; server code wraps individual commands
with the SDK's `withToken`:

```ts
// layers/customers/server/utils/directus-auth.ts
const client = getServerDirectusClient()          // module-level, unauthenticated
await client.request(withToken(accessToken, readMe({ fields: [...] })))
```

Rationale: a client per request allocates on every SSR render for no gain
— the SDK's auth is per-command anyway. `getStudentToken(event)` is the
one entry point: it reads the session, refreshes through Directus
`/auth/refresh` when `expiresAt` is within a 60 s skew, writes the rotated
pair back into the session, and returns a token guaranteed valid for the
rest of the request. A failed refresh clears the session and throws 401.

The `directus` layer gains `layers/directus/server/utils/directus.ts`
holding the Nitro-side singleton (`getServerDirectusClient()`, reading
`useRuntimeConfig().public.directusUrl`) — the "future server client
wrapper" area 00 anticipated. Client construction stays in the `directus`
layer; session awareness stays in `customers`.

### 3. Registration: Directus public registration

`POST /users/register` with `public_registration: true` and
`public_registration_role` = Student. Directus assigns the role, hashes
the password, and sends the verification e-mail through the already
configured Mailgun (TO-6). No service token enters the Nuxt env, and the
Student role description already says _"přiřazováno při registraci"_.

Instance-side prerequisites — **human work in the Directus admin app**,
not doable from this repo (directus-sync is pull-only and no
`DIRECTUS_TOKEN` is available here):

- `public_registration: true`, `public_registration_role` = Student,
  `public_registration_verify_email: true` (currently all off/null in
  `directus/config/collections/settings.json`)
- `USER_REGISTER_URL_ALLOW_LIST` = `https://www.jedlik-nejedlik.cz/registrace/overeni`
- `PASSWORD_RESET_URL_ALLOW_LIST` = `https://www.jedlik-nejedlik.cz/nove-heslo`

Both allow-lists are Directus env vars on the Coolify-hosted instance. The
verification and reset e-mails link to **our** pages, which post the token
back through our own server routes — the Student never lands on a Directus
URL.

Registration does not create a session: the account is unverified until
the e-mail link is followed. After successful verification the page offers
login rather than auto-authenticating (we hold no password at that point).

### 4. Routes and pages

Server routes, all in `layers/customers/server/api/auth/`, all thin
proxies that validate input, call Directus, and map errors:

| Route                     | Directus call                    | Session effect     |
| ------------------------- | -------------------------------- | ------------------ |
| `POST /api/auth/register` | `registerUser`                   | none               |
| `POST /api/auth/verify`   | `registerUserVerify`             | none               |
| `POST /api/auth/login`    | `login` + `readMe`               | `setUserSession`   |
| `POST /api/auth/logout`   | `logout` (revokes refresh token) | `clearUserSession` |
| `POST /api/auth/password` | `passwordRequest`                | none               |
| `PUT /api/auth/password`  | `passwordReset`                  | none               |

Pages in `layers/customers/app/pages/`, Czech kebab-case like the rest of
the site:

- `/registrace` — register form
- `/registrace/overeni` — verification landing (reads `?token=`)
- `/prihlaseni` — login form, honours `?next=` for post-login redirect
- `/zapomenute-heslo` — request a reset link
- `/nove-heslo` — set a new password (reads `?token=`)
- `/ucet` — minimal signed-in page: e-mail + logout. Proves SSR session
  and gives areas 03–06 a place to hang onto.

Logout is an action on `/ucet`, not a page.

`next=` is accepted only as a path starting with a single `/` — never a
full URL — so the redirect cannot be pointed off-site.

### 5. Route protection: middleware for UX, server checks for truth

`layers/customers/app/middleware/auth.ts` is a **named** middleware
(opt-in via `definePageMeta`), redirecting anonymous visitors to
`/prihlaseni?next=<path>`. It is a UX affordance only.

Real enforcement is `requireUserSession(event)` in server routes plus
Directus's own row-level policies from area 01 (R-5: "Přístup vynucen na
serveru"). No page middleware is ever the only thing between a Student and
paid content.

### 6. Validation and error mapping

zod codecs in `layers/customers/shared/utils/auth-schemas.ts`, shared by
server routes and client forms. Password minimum 8 characters — matched to
the instance's `auth_password_policy` (`/^.{8,}$/`) so the client never
promises what Directus rejects.

**Server routes own the Czech user-facing message.** They map Directus
failures to a `createError({ statusCode, statusMessage })` the form
renders directly. This keeps wording in one place and lets the mapping
enforce the enumeration rules below; the client never interprets a
Directus error code.

Anti-enumeration: `POST /api/auth/register` and `POST /api/auth/password`
always answer 204 regardless of whether the e-mail exists. Login answers a
single "Nesprávný e-mail nebo heslo." for unknown-user, wrong-password,
and unverified-account alike.

### 7. Runtime config: private key validated in the root schema

`nuxt-auth-utils` reads `runtimeConfig.session.password` from
`NUXT_SESSION_PASSWORD`. Area 00 said layers "add schema entries there"
(in their own config), but `@lttr/nuxt-validated-runtime-config` imports
exactly one schema file via `~~/server/runtime-config.schema`, so a
per-layer schema is not possible. The key is declared in the root
`web/server/runtime-config.schema.ts` as the first entry in `privateSchema`
(currently `undefined`), with `z.looseObject` so other modules' keys pass
through. `NUXT_SESSION_PASSWORD` is added to `web/.env.example`.

Known friction: in dev, when the variable is missing, `nuxt-auth-utils`
generates one and **writes it to `web/.env`** — which contradicts the
CLAUDE.md rule that env vars always come from the environment, never a
generated file. We accept the module's behaviour rather than patching it;
`.env` is gitignored, and production must set the variable explicitly (a
32+ character minimum in the schema fails the boot otherwise).

## Testing decisions

The repo has no default unit-test run today — only on-demand Directus
probes. This area adds one.

- **Pure logic → unit tests** (`web/tests/unit/**/*.test.ts`, plain
  vitest via the existing `vitest-probe` alias, new `verify:test` task in
  `vite.config.ts`, added to `verify:all`). Seams worth testing: the zod
  auth codecs, the Directus-error → Czech-message mapping, the `next=`
  redirect sanitiser, and the token-refresh expiry decision (a pure
  function of `expiresAt` + `now`, so it needs no network).
- **Server routes** are thin proxies over Directus; there is no
  `@nuxt/test-utils` in the project and adding an SSR test harness is a
  larger call than this area should make. They are covered by the live
  round-trip below, and kept thin precisely so that is enough.
- **Live round-trip** (register → verify e-mail → login → reset → login)
  runs against the real instance once the instance-side settings in
  decision 3 are on. It needs a real inbox, so it is human work — its own
  ticket, mirroring how area 01 handled FP-11.
- **Smoke** (`scripts/smoke-dev.sh`) already boots dev and fetches `/`; it
  catches a broken session plugin or an unresolvable runtime config key.

## Out of scope

- Magic-link / passwordless login — TO-2 defers it explicitly.
- Social / SSO providers.
- Profile editing beyond what `/ucet` shows; address and billing fields
  belong to the Order (area 04a).
- Any catalog, checkout, entitlement, or player behaviour — this area only
  establishes _who_ is asking.
- Two-factor auth, account deletion, GDPR export.
- Styling beyond the site's existing Puleo defaults; these forms follow
  the markup patterns of the current marketing forms.

## Verification

- `vp run verify:all` green (check, lint, typecheck, fallow, smoke,
  build), plus the new `verify:test`.
- Signed-out visit to `/ucet` redirects to `/prihlaseni?next=/ucet`.
- `GET /api/_auth/session` returns `{}` anonymous, and after login returns
  the `user` half with **no** token fields — verified in the browser, not
  just asserted in code.
- Session survives a full page reload (SSR reads the cookie) and a Nitro
  restart is not required to pick it up.
- Live round-trip per the testing decisions, once the instance settings
  are on.
