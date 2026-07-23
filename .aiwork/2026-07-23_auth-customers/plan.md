# Plan — Auth / customers layer (area 02)

Files all live under `web/layers/customers/`. Nuxt layer auto-registration
already wired by area 00.

## 1. Shared auth schemas — `shared/utils/auth.ts`

zod schemas + inferred types, importable from both server routes and client
forms (layer `shared/` is dual-target, matching the directus layer's
`shared/utils/schemas.ts`):

- `credentialsSchema` — `{ email: string.email, password: min(8) }` (matches
  Directus `auth_password_policy /^.{8,}$/`).
- `registerSchema` — credentials + optional `first_name`, `last_name`.
- `passwordRequestSchema` — `{ email }`.
- `passwordResetSchema` — `{ token, password: min(8) }`.
- `SessionUser` interface — `{ id, email, first_name?, last_name? }`.

## 2. Server session util — `server/utils/directus-auth.ts`

- `COOKIE_ACCESS = "d_access"`, `COOKIE_REFRESH = "d_refresh"`.
- `cookieOpts(event)` → `{ httpOnly: true, secure: <prod>, sameSite: "lax",
path: "/" }`.
- `setSession(event, auth)` — write `d_access` (maxAge from `auth.expires` ms →
  s) + `d_refresh` (maxAge = 7 days, Directus default REFRESH_TOKEN_TTL).
- `clearSession(event)` — delete both cookies.
- `resolveAccessToken(event)` — read `d_access`; if missing, read `d_refresh`,
  call `refresh({ refresh_token, mode: "json" })` on a bare client, `setSession`
  the rotated pair, return the new access token; else `null`.
- `getAuthedClient(event)` — `resolveAccessToken`; if null return null, else
  `createDirectus(url).with(staticToken(token)).with(rest())` typed to `Schema`.
- `directusMessage(error, fallback)` — extract a safe message from a thrown SDK
  error (`errors[0].message`) without leaking internals; used by routes to map
  to Czech user messages + right status.

Uses the directus layer's `runtimeConfig.public.directusUrl` (server can read
public runtime config).

## 3. Nitro routes — `server/api/auth/*`

Each `defineEventHandler`, `readValidatedBody` with the zod schema, try/catch →
`createError({ statusCode, statusMessage })` with Czech messages.

- `register.post.ts` — `registerUser(email, password, { verification_url:
<origin>/prihlaseni?verified=1, first_name, last_name })`. 204.
- `login.post.ts` — `login({ email, password }, { mode: "json" })` →
  `setSession` → return `SessionUser` (from the login data's `readMe`, or a
  follow-up `readMe` call). 200.
- `logout.post.ts` — read `d_refresh`; best-effort `logout({ refresh_token,
mode: "json" })`; `clearSession`. 204.
- `password-request.post.ts` — `passwordRequest(email, <origin>/obnova-hesla)`.
  Always 204 (never reveal whether the email exists).
- `password-reset.post.ts` — `passwordReset(token, password)`. 204.
- `me.get.ts` — `getAuthedClient`; null → 200 `{ user: null }`; else
  `readMe({ fields: ["id","email","first_name","last_name"] })` → `{ user }`.
  On refresh failure clear session + `{ user: null }`.

`<origin>` from `getRequestURL(event)` / `getRequestProtocol`+`getRequestHost`
so reset/verify links point at the current deployment.

## 4. Client composable — `app/composables/auth.ts`

- `useAuthUser()` = `useState<SessionUser | null>("auth.user", () => null)`.
- `useAuth()` returns `{ user, isLoggedIn, register, login, logout,
requestPasswordReset, resetPassword }`. Each action `$fetch`es the matching
  route; `login` sets `user.value`; `logout` clears it and
  `navigateTo("/prihlaseni")`.

## 5. SSR hydration plugin — `app/plugins/auth.ts`

Runs universal. If `user.value` empty, `const { user } = await
useRequestFetch()("/api/auth/me")` (server forwards cookies) → set state. Guard
so it runs once; client reuses SSR payload (`useState` serialised).

## 6. Route middleware — `app/middleware/auth.ts`

Named (opt-in) middleware: if `!useAuthUser().value` → `navigateTo({ path:
"/prihlaseni", query: { redirect: to.fullPath } })`. Used via
`definePageMeta({ middleware: "auth" })` on gated pages (e.g. `/ucet`).

## 7. Pages — `app/pages/*` (Czech, existing form components/styles)

- `prihlaseni.vue` — login form; on success honour `?redirect=`; shows
  `?verified=1` / `?reset=1` notices.
- `registrace.vue` — register form; success = "check your email to verify".
- `odhlaseni.vue` — calls `logout()` on mount, redirects home.
- `zapomenute-heslo.vue` — email field → `requestPasswordReset`; always shows
  the same confirmation.
- `obnova-hesla.vue` — reads `?token=`; new-password field → `resetPassword` →
  redirect `/prihlaseni?reset=1`.
- `ucet.vue` — `definePageMeta({ middleware: "auth" })`; shows the user's email +
  a logout button. Proves the session end-to-end.

Reuse existing form primitives where they exist (check `components/`); otherwise
plain semantic markup with the site's CSS. Keep styling minimal — polish is out
of scope.

## 8. Verify

- `nuxi typecheck`, eslint, fallow, `vp run build` green.
- Document that the live staging round-trip is gated on enabling
  `public_registration` (spec Open prerequisites).

## Open items

- `[OPEN]` Instance settings change (public registration + Student default
  role) — needs admin token; documented as prerequisite, not done here.
- `[OPEN]` Exact Student policy `app_access` value — verify on pull that a
  logged-in end user gets API access without Directus admin-app access.
