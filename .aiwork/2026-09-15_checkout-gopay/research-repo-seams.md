# Research — repo seams for Checkout + GoPay

Written for the six implementers of `.aiwork/2026-09-15_checkout-gopay/`.
Paths are relative to the repo root. Quotes are verbatim from the worktree.
Where something was not found, it says so explicitly.

---

## 1. Layer layout

`web/app` is the base layer (pages, components, composables, plugins, utils
with no domain prefix). Layers live under `web/layers/*`, each its own
`nuxt.config.ts` that Nuxt registers as a layer. **No `extends:` array** in
`web/nuxt.config.ts` — layer discovery is automatic (via `@dxup/nuxt`; not
investigated further, but a new file inside an existing layer needs no
registration).

```
web/layers/
  auth/      # identity: login, register, verify, account, session, rate-limit
  directus/  # Directus SDK wrapper + schema types, no domain logic
  lms/       # course view/progress/tests/video (areas 06-08) — EMPTY today
  shop/      # catalog, checkout, payments, invoicing (areas 03-05)
```

Each layer's `nuxt.config.ts` is a marker/config file, e.g.:

```ts
// layers/shop/nuxt.config.ts
// Marker so Nuxt registers this directory as a layer. Owns catalog,
// checkout, payments, invoicing (areas 03-05).
export default defineNuxtConfig({
  routeRules: coursesPublic ? {} : { "/kurzy": { robots: false }, "/kurzy/**": { robots: false } },
  sitemap: { sources: coursesPublic ? ["/api/__sitemap__/courses"] : [] },
})
```

Inside a layer: `app/pages|components|composables|utils|middleware/**`
(browser+SSR), `server/api/**` (Nitro routes, filename-routed:
`courses/[slug].get.ts` → `GET /api/courses/:slug`), `server/utils/**`
(Nitro-only, auto-imported), `server/middleware/**`, `shared/utils|types/**`
(no Vue/Nitro APIs, usable from both).

**Component auto-import prefixing.** Root `nuxt.config.ts` registers
`~/components` (base `web/app/components`) with `pathPrefix: false` — no
prefix (`PageWrapper`, `TagLink`). Layers get Nuxt's default layer-relative
prefix: `layers/auth/app/components/auth/Panel.vue` → `<AuthPanel>`;
`layers/shop/app/components/sales/Bespoke.vue` → `<SalesBespoke>`;
`layers/shop/app/components/CourseCover.vue` (no subfolder) → `<CourseCover>`
(no `Shop` prefix). Confirm by grepping existing usages before assuming for
a new component.

### `shop` layer today (full listing)

```
layers/shop/
  app/components/CourseCover.vue
  app/components/catalog/CourseCard.vue
  app/components/sales/Bespoke.vue, Outline.vue, content/TestKurzPublikovany.vue
  app/pages/kurzy/[slug].vue          # Sales Page
  app/pages/kurzy/index.vue           # Catalog
  app/utils/sales-content.ts
  server/api/__sitemap__/courses.get.ts
  server/api/courses.get.ts           # Catalog route
  server/api/courses/[slug].get.ts    # Sales Page route
  server/utils/course-query.ts
  shared/utils/catalog-order.ts, catalog.ts, lesson-count.ts, og-image.ts,
              price.ts, sales.ts, typography.ts
```

Nothing checkout/payment-related exists — tickets 01-06 create it all here.
`/objednavka/<slug>` and `/objednavka/<id>/navrat` are new pages under
`layers/shop/app/pages/objednavka/`.

**`layers/lms` is empty** (just the marker). Per spec §Placement, "Moje
kurzy"/"Fakturační údaje" live in `shop`, not `lms` — don't create
shop-domain code under `lms`.

---

## 2. Directus server clients in Nitro

Three-tier design, all typed `DirectusRestClient = DirectusClient<Schema> & RestClient<Schema>`.

**Factories** — `web/layers/directus/shared/utils/directus.ts` (pure, no Vue/Nitro API):

```ts
export function createDirectusClient(url: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(rest())
}
// Whose token it is, and where it came from, is not this layer's business.
export function createDirectusTokenClient(url: string, token: string): DirectusRestClient {
  return createDirectus<Schema>(url).with(staticToken(token)).with(rest())
}
```

`createDirectusTokenClient` is already the seam for the Service Account
client — ticket 01 just calls it with `DIRECTUS_SHOP_TOKEN` and caches it.

**1. Anonymous client** — `web/layers/directus/server/utils/directus-server.ts`:

```ts
let client: DirectusRestClient | null = null
export function getDirectusAnonymousServerClient(event: H3Event): DirectusRestClient {
  client ??= createDirectusClient(useRuntimeConfig(event).public.directusUrl)
  return client
}
```

**2. Caller-bound client** — `web/layers/auth/server/utils/account-session.ts`:

```ts
export async function getAccountDirectusClient(event: H3Event): Promise<DirectusRestClient | null> {
  const token = await resolveAccountAccessToken(event)
  if (token === null) return null
  return createDirectusTokenClient(useRuntimeConfig(event).public.directusUrl, token)
}

// One 401 for every gated route, so the next one (a course, an order) does
// not invent its own.
export async function requireAccountDirectusClient(
  event: H3Event,
): Promise<{ account: Account; client: DirectusRestClient }> {
  const { account } = await readAccountSession(event)
  const client = await getAccountDirectusClient(event)
  if (account === undefined || client === null) {
    throw authError(401, "not_logged_in", authMessages.notLoggedIn)
  }
  return { account, client }
}
```

Use `requireAccountDirectusClient(event)` for the Checkout route and the
"Moje kurzy"/"Fakturační údaje" routes.

**Optionally-authenticated** — `layers/auth/server/utils/caller-client.ts`:

```ts
export async function getCallerDirectusClient(event: H3Event): Promise<DirectusRestClient> {
  return (await getAccountDirectusClient(event)) ?? getDirectusAnonymousServerClient(event)
}
```

Used by the Catalog/Sales Page routes (ADR 0004). Ticket 05: the Sales
Page's Entitlement read must use this, "no Service Account".

**3. Service Account client — not found, ticket 01 builds it.** By analogy
with the anonymous client, likely a sibling file (e.g.
`layers/shop/server/utils/directus-shop.ts`, since the directus layer's own
comment says it owns "no domain logic"):

```ts
let shopClient: DirectusRestClient | null = null
export function getDirectusShopClient(event: H3Event): DirectusRestClient {
  shopClient ??= createDirectusTokenClient(
    useRuntimeConfig(event).public.directusUrl,
    useRuntimeConfig(event).directusShopToken, // private runtime config, §3
  )
  return shopClient
}
```

The token must be a **private** runtime-config key, never `public.*`.

**SDK usage patterns observed**: import directly from `@directus/sdk` (no
further wrapping) — `rest()`, `staticToken()`, `login()`, `logout()`,
`refresh()`, `registerUser()`, `registerUserVerify()`, `readItems()`. No
`createItem`/`updateItem` usage exists yet anywhere in the repo — Order/
Entitlement writes (tickets 01/03/04) are new territory; follow the same
`client.request(readItems("course", {...}))` call shape with `createItem`/
`updateItem`.

---

## 3. Runtime config

**`web/nuxt.config.ts`** `runtimeConfig` block (verbatim):

```ts
runtimeConfig: {
  session: {
    password: "",
    maxAge: 30 * 24 * 60 * 60,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" },
  },
  public: {
    coursesPublic: false,
    directusUrl: "",
  },
},
```

No private top-level key exists besides `session`. `DIRECTUS_SHOP_TOKEN`,
`GOPAY_ENV`, `GOPAY_GOID`, `GOPAY_CLIENT_ID`, `GOPAY_CLIENT_SECRET` are all
new **private** keys (tickets 01 and 02) added as top-level `runtimeConfig`
entries, e.g. `runtimeConfig: { directusShopToken: "", gopayEnv: "", ... }`.

**`web/server/runtime-config.schema.ts`** (full file):

```ts
import { z } from "zod"
import { definePublicSchema, url } from "@lttr/nuxt-validated-runtime-config/schema"
import type { Url } from "@lttr/nuxt-validated-runtime-config/schema"

export const publicSchema = definePublicSchema({
  coursesPublic: z.boolean(),
  directusUrl: url("DIRECTUS_URL", { public: true }),
})

export const privateSchema: z.ZodType | undefined = z.looseObject({
  session: z.looseObject({
    password: z.string().min(32, { error: "NUXT_SESSION_PASSWORD must be at least 32 characters" }),
  }),
})

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    coursesPublic: boolean
    directusUrl: Url
  }
}
```

Both `DIRECTUS_SHOP_TOKEN` (01) and the four `GOPAY_*` (02) are **private**,
so neither touches `publicSchema` or the `declare module` block (that
augmentation is public-only). Both add sibling keys inside the same
top-level `privateSchema` `z.looseObject({...})`, alongside `session`, e.g.:

```ts
export const privateSchema: z.ZodType | undefined = z.looseObject({
  session: z.looseObject({ password: z.string().min(32, {...}) }),
  directusShopToken: z.string().min(1, { error: "DIRECTUS_SHOP_TOKEN is required" }),
  gopayEnv: z.enum(["mock", "sandbox", "production"]),
  gopayGoid: z.string(),
  gopayClientId: z.string(),
  gopayClientSecret: z.string(),
})
```

A parallel edit to the same object literal — a textual merge, not a design
conflict; whoever lands second adds their keys next to the other's.
`z.looseObject` (not `z.object`) passes extra keys through ungated.
`url()` is only used for URLs; plain `z.string()`/`z.enum()` elsewhere.
Rejecting `mock` under `NODE_ENV=production` (ticket 02 AC) has no existing
precedent in this schema (first case of that shape) — a `.refine()`/
`.superRefine()` here, or a check elsewhere, is the implementer's call.

**When validation runs**: the module (`@lttr/nuxt-validated-runtime-config`)
is registered in `nuxt.config.ts`'s `modules` array; treat it as running at
server boot (not verified deeper in this pass — see the module's own
README, per the schema file's own header comment).

**`.env.example`** — new keys go under the existing `# --- Runtime ---`
section (current keys: `NUXT_PUBLIC_DIRECTUS_URL`,
`NUXT_PUBLIC_COURSES_PUBLIC`, `NUXT_SESSION_PASSWORD`), each with a one-line
comment in the same terse style. Nothing automatic enforces sync with the
schema — it's a documented discipline, not a check.

---

## 4. Auth layer helpers

**`authPageUrl(event, path)`** — `layers/auth/server/utils/auth-urls.ts`:

```ts
// Built from the configured site URL rather than the request origin, so a
// forged Host header cannot steer where the e-mail points.
export function authPageUrl(event: H3Event, path: string): string {
  return new URL(path, getSiteConfig(event).url).href
}
```

Exactly the helper the spec says to reuse for GoPay's `callback.return_url`/
`callback.notification_url`. `getSiteConfig` is from `@nuxtjs/seo`,
auto-imported.

**Rate limiter** — `layers/auth/server/utils/rate-limit.ts`:

```ts
export interface RateLimit {
  bucket: string
  max: number
  message: string
}
export function enforceRateLimit(event: H3Event, { bucket, max, message }: RateLimit): void
```

In-process `Map<string, number[]>` keyed `${bucket}:${ip}`, 15-min sliding
window, throws `authError(429, "rate_limited", message)` past `max`.
Existing consts: `LOGIN_RATE_LIMIT` (20), `REGISTER_RATE_LIMIT` (10),
`VERIFY_EMAIL_RATE_LIMIT` (20), `PASSWORD_REQUEST_RATE_LIMIT` (10),
`PASSWORD_RESET_RATE_LIMIT` (20), `CHANGE_PASSWORD_RATE_LIMIT` (10). Applied
as the first line of the handler:

```ts
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, LOGIN_RATE_LIMIT)
  await logInAccount(event, await readCredentials(event))
  sendNoContent(event)
})
```

Tickets 03 (Checkout) and 04 (notification route) each need a new named
`RateLimit` const (e.g. `CHECKOUT_RATE_LIMIT`, `GOPAY_NOTIFY_RATE_LIMIT`) —
`enforceRateLimit` is importable from any layer; the consts likely belong
in the shop layer since `rate-limit.ts`'s own header scopes itself to "the
unauthenticated auth routes".

**`safeRedirectPath` / redirect constants** —
`layers/auth/shared/utils/redirects.ts` (full file):

```ts
export const DEFAULT_AUTH_REDIRECT = "/muj-ucet"
export const VERIFY_EMAIL_PATH = "/overeni-emailu"
export const RESET_PASSWORD_PATH = "/obnova-hesla"
export const EMAIL_VERIFIED_QUERY = "overeno"
export const PASSWORD_CHANGED_QUERY = "heslo-zmeneno"

const PLACEHOLDER_ORIGIN = "https://redirect.invalid"

export function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string" || raw === "") return DEFAULT_AUTH_REDIRECT
  try {
    const url = new URL(raw, PLACEHOLDER_ORIGIN)
    return url.origin === PLACEHOLDER_ORIGIN
      ? `${url.pathname}${url.search}${url.hash}`
      : DEFAULT_AUTH_REDIRECT
  } catch {
    return DEFAULT_AUTH_REDIRECT
  }
}
```

Login page calls `safeRedirectPath(route.query.redirect)`. Ticket 06 needs
the pending-checkout cookie to feed this same function as the fallback
target when `?redirect=` is absent. Unit-test prior art:
`web/tests/unit/redirects.test.ts` (protocol-relative, backslash tricks,
`javascript:`/`data:` schemes, control chars — all fall back to
`DEFAULT_AUTH_REDIRECT`; a stripped newline/encoded null byte case stays
on-origin).

**Session shape (nuxt-auth-utils)** — single seam:
`layers/auth/server/utils/session-store.ts`. `readAccountSession(event)`
reads `{ user, secure } = await getUserSession(event)` →
`{ account: user, secrets: secure }`. Writes use `replaceUserSession` (not
`setUserSession`) so the 30-day window slides. `Account = { email: string }`
only (no Directus id cached client-side). `AccountSecrets = { accessToken,
refreshToken, accessTokenExpiresAt }` — never reaches the browser (ADR
0002). Comment: "the session plumbing says Account, never 'user' or
'student'; Student is the learner and buyer" — follow this terminology.

**Login page** — `layers/auth/app/pages/prihlaseni.vue`. `useAuthActions().logIn({email,password})`
→ `POST /api/auth/login` (`login.post.ts`: rate limit → `logInAccount` →
`sendNoContent`, 3 lines). `definePageMeta({ middleware: "guest" })`,
`robots: false`. Notice reads `route.query[EMAIL_VERIFIED_QUERY]` /
`[PASSWORD_CHANGED_QUERY]`. On success: `navigateTo(safeRedirectPath(route.query.redirect))`.

**Registration page** — `layers/auth/app/pages/registrace.vue`. Posts via
`useAuthActions().register({email,password})` → `POST /api/auth/register` →
`registerStudent` (`layers/auth/server/utils/registration.ts`) →
`registerUser(email, password, { verification_url: authPageUrl(event, VERIFY_EMAIL_PATH) })`.
Client-side check before submit: `validatePassword(password.value)` (route
re-validates via `assertPasswordPolicy`). On success shows "Zkontrolujte
e-mail" with the address — exactly the UI ticket 06 reproduces inline in
step 1.

**Verification landing page** — `layers/auth/app/pages/overeni-emailu.vue`.
`useEmailedToken()` → `{ token, scrubbed }`, then
`submit(async () => { await verifyEmail(token); await navigateTo({ path: "/prihlaseni", query: { [EMAIL_VERIFIED_QUERY]: "1" } }, { replace: true }) })`.
**This `navigateTo` target is exactly what ticket 06 changes** — spec
Further Notes: "with the pending-checkout cookie it forwards to the
Checkout instead". `verifyEmail` → `POST /api/auth/verify-email` →
`verifyAccountEmail` → `registerUserVerify(token)`.

**`useAuthActions`/`useAuthForm`** — `layers/auth/app/composables/auth.ts`,
`auth-form.ts` (not read in full). `useAuthForm()` exposes `{ pending,
errorMessage, succeeded, submit }`, used identically across every auth page
— `submit(action, clientValidator?)` wraps try/catch, sets `pending`, maps
thrown errors via an error-message mapper. Reuse for the Checkout's step-1
tabs rather than inventing new pending/error state.

---

## 5. Existing Nitro API routes

**Auth** (`layers/auth/server/api/auth/`): `login.post.ts`, `logout.post.ts`,
`register.post.ts`, `verify-email.post.ts`, `change-password.post.ts`,
`password-request.post.ts`, `password-reset.post.ts` — all `/api/auth/*`.

**Shop** (`layers/shop/server/api/`): `courses.get.ts` → `GET /api/courses`
(Catalog); `courses/[slug].get.ts` → `GET /api/courses/:slug` (Sales Page);
`__sitemap__/courses.get.ts`.

**Directus**: no routes, only client factories. **LMS**: no routes (empty).

### Representative route in full — house style

`layers/shop/server/api/courses/[slug].get.ts`:

```ts
import { readItems } from "@directus/sdk"

// The caller's own session decides what Directus returns, so a draft is
// readable by its Author and absent for everyone else. Absent means 404,
// the same 404 as a slug that never existed.
export default defineEventHandler(async (event): Promise<SalesCourse> => {
  const slug = getRouterParam(event, "slug") ?? ""
  const client = await getCallerDirectusClient(event)
  const rows = await client.request(
    readItems("course", {
      fields: [...COURSE_PUBLIC_FIELDS, { sections: [...] }],
      filter: { status: { _in: SHOP_COURSE_STATUSES }, slug: { _eq: slug } },
      limit: 1,
    }),
  )
  const row = rows[0]
  if (row === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" })
  }
  return parseSalesCourse(row)
})
```

House style, generalized:

- One job per file: `export default defineEventHandler(async (event) => {...})`.
- **Errors**: `createError({ statusCode, statusMessage, message? })` (h3,
  auto-imported), thrown directly. Auth layer wraps it as
  `authError(statusCode, code, message)` (`statusMessage` = short ASCII
  code, `message` = Czech text). A shop-layer equivalent for 409s
  ("already entitled", "no price") doesn't exist yet — write one following
  `authError`'s shape.
- **Validation**: zod schemas colocated with the route or a sibling
  `server/utils/*.ts`, via `schema.safeParse` (see `readAuthBody` in
  `auth-input.ts`), never zod's raw thrown error.
- **Response shape**: routes return the parsed/typed domain object directly
  — no envelope — or `sendNoContent(event)` for void mutations. Directus's
  raw wire rows always pass through a codec (`XSchema.parse(raw)`, §6)
  before leaving the route.
- **Directus error inspection**: `directusErrorCode(error)` parses
  Directus's `{ errors: [{ extensions: { code } }] }` shape; unexpected
  failures go through `unexpectedAuthError(context, cause, message)`
  (`console.error` + generic 502). A `RECORD_NOT_UNIQUE` check for the
  Entitlement idempotency (spec §Settlement) follows the same
  `directusErrorCode(error) === "RECORD_NOT_UNIQUE"` pattern.
- **Auto-imports relied on, no explicit import anywhere**:
  `defineEventHandler`, `createError`, `getRouterParam`, `getCookie`,
  `readBody`, `sendNoContent`, `useRuntimeConfig`,
  `getUserSession`/`replaceUserSession`/`clearUserSession`, `getSiteConfig`.
  Nitro auto-imports `server/utils/**` across **all** layers — a shop route
  calls `getCallerDirectusClient`/`getDirectusAnonymousServerClient` (both
  defined in other layers) with zero imports.

---

## 6. Sales page + catalog

**Route**: `layers/shop/app/pages/kurzy/[slug].vue` at `/kurzy/<slug>`.
Fetches `useFetch(\`/api/courses/${slug}\`, { key: \`course:${slug}\` })`.
404/any error rethrown as `fatal: true` page error.

**„Koupit kurz" button** — today, in the same file:

```vue
<p class="offer">
  <strong v-if="course.price_czk !== undefined" class="price">
    {{ formatPriceCzk(course.price_czk) }}
  </strong>
  <NuxtLink :to="`/objednavka/${course.slug}`" class="p-button p-button-brand">Koupit kurz</NuxtLink>
</p>
```

Links to `/objednavka/<slug>` unconditionally whenever `price_czk` is set —
route doesn't exist yet (spec: "leads to a route that does not exist").
Ticket 05 makes it state-aware (visitor/no-entitlement → „Koupit kurz";
owner → „Přejít do kurzu"; no price → no button), editing this exact block
and threading an `entitlement` field through the route response (read via
`getCallerDirectusClient`, no Service Account).

**Price formatting** — `layers/shop/shared/utils/price.ts`:

```ts
export function formatPriceCzk(priceCzk: number): string {
  const grouped = String(priceCzk).replaceAll(/\B(?=(\d{3})+(?!\d))/g, NON_BREAKING_SPACE)
  return `${grouped}${NON_BREAKING_SPACE}Kč`
}
```

`price_czk` whole koruny, no rounding. Hand-rolled grouping with `U+00A0`,
not `Intl.NumberFormat`, "so the output does not depend on the ICU data of
whichever runtime renders it." `web/tests/unit/price.test.ts` tests:
thousands grouping, multi-group grouping, sub-1000 (ungrouped), non-breaking
space before "Kč" (not a plain space). Direct prior art for ticket 02's
haléře-conversion unit test — same file/test style, e.g. a new
`layers/shop/shared/utils/gopay.ts` + `web/tests/unit/gopay.test.ts`.

**Order/Consent/Entitlement schema** already defined —
`layers/directus/shared/utils/schemas.ts`:

```ts
export interface Order {
  id: number
  student: string
  course: number
  status: "created" | "paid" | "cancelled"
  price_czk: number
  gopay_payment_id?: string
  fakturoid_invoice_id?: string
}
export interface OrderConsent {
  id: number
  order: number
  document: "terms" | "withdrawal_1837" | "gdpr"
  document_version: string
  granted_at: string
}
export interface Entitlement {
  id: number
  student: string
  course: number
  order?: number
  granted_at?: string
}
```

`billing_*` fields (ticket 01) are not on `Order` yet — add to
`OrderSchema`/`OrderCollection` following the existing
`z.string().nullable()` → `?? undefined` pattern. The `Schema` interface
mapping collection → row type is in `layers/directus/shared/types/directus.ts`.

---

## 7. Account page (auth layer)

File: `layers/auth/app/pages/muj-ucet.vue`, route `/muj-ucet`,
`definePageMeta({ middleware: "auth" })`, `robots: false`.

Current composition — one `<AuthPanel title="Můj účet">` wrapping: (1)
`Jste přihlášeni jako {{ account?.email }}` + logout button, (2) an
`<h2 class="p-heading-4">Změna hesla</h2>` section with its own form and its
own `useAuthForm()` instance.

"Moje kurzy"/"Fakturační údaje" slot in the same way: additional
`<h2 class="p-heading-4">` sections in this file, each backed by a
shop-layer component (spec §Placement: "as components the auth layer's page
includes"). The page itself stays in the auth layer; only the pending-
checkout cookie handling and this cross-layer inclusion are the auth
layer's involvement — the components' logic and their Nitro routes are
shop-layer code.

`useAccount()` (`layers/auth/app/composables/account.ts`, not read in full)
exposes `{ account }` reactively — reuse for the e-mail display.

---

## 8. Testing seams

**`web/vitest.unit.config.ts`** (full): `include: ["tests/unit/**/*.test.ts"]`,
`passWithNoTests: true`. Run via `vp test run --config vitest.unit.config.ts`
(what `check:test` runs, part of `check:all`).

**`web/vitest.probes.config.ts`** (full):

```ts
process.loadEnvFile(new URL(".env", import.meta.url).pathname)
export default defineConfig({
  test: {
    include: ["tests/probes/**/*.probe.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false, // network tests: sequential, go easy on the instance
  },
})
```

Run via `vp run directus:probe` (→ `scripts/directus-probe.sh`: runs this
config, then stamps `.directus-probe-stamp`). **Naming rule**: `*.probe.ts`
under `tests/probes/` only matches the probes config; `*.test.ts` under
`tests/unit/` only the unit config — name new flow tests
`tests/probes/<name>.probe.ts` exactly, per spec §Testing Decisions ("run
under the probe config so they are excluded from `check:all`").

### `web/tests/probes/support.ts` — helper inventory (full file read)

Fixture constants (production-instance `[TEST]` rows, ids pinned here):
`DIRECTUS_URL`, `ENTITLED_ID`/`UNENTITLED_ID`, `PUBLISHED_COURSE_ID` (`1`),
`PUBLISHED_SLUG`/`DRAFT_SLUG`, file/folder ids.

HTTP helpers (raw `fetch` against `DIRECTUS_URL` — hit the Directus REST API
directly, **not** the Nuxt app):

```ts
export async function probe(path: string, token?: string): Promise<ProbeResponse>
export async function probeSend(method: "POST"|"PATCH"|"DELETE", path: string, body: unknown, token?: string): Promise<ProbeResponse>
export async function probeUpload(token: string, file: {...}, fields?: Record<string,string>): Promise<ProbeResponse>
export async function probeStatus(path: string, token?: string): Promise<number>
```

`ProbeResponse = { status: number; body: { data?: unknown; errors?: {...}[] } }`.
Flow tests through the mock gateway (spec's "only new" testing seam) need to
hit the **Nuxt app's own routes** instead — not what these helpers target.
**Gap**: `@nuxt/test-utils` is not a current dependency (checked
`package.json`), and no existing pattern drives the running app's HTTP
surface from a test. Ticket 04 needs to resolve this: either add
`@nuxt/test-utils`, or drive the mock gateway's in-memory state via imported
functions rather than real HTTP. Flag early.

Auth/role helpers: `roleToken(envVar)` (reads `process.env[envVar]`, throws
if unset); `roleIdByName(name, token)` (live lookup — dump ids ≠ live ids).

Assertions:

```ts
export function items(response): Record<string, unknown>[] // asserts Array.isArray(data)
export function nonEmptyItems(response): Record<string, unknown>[] // asserts status 200 AND length > 0
export function item(response): Record<string, unknown> // single-item read
export function errorCode(response): string | undefined // body.errors?.[0]?.extensions?.code
```

Misc: `forget(list, value)` (splice out — cleanup-array pattern),
`generatePassword()` (`Pw-${randomUUID()}`, never a literal).

### `student-scoping.probe.ts` / `author.probe.ts` — pattern to copy

Both (~370-385 lines) share one skeleton: (1) header comment naming the
matrix under test, required `DIRECTUS_PROBE_*` env vars, and a pointer to
`implementation-notes.md`; (2) `const TOKEN = roleToken("DIRECTUS_PROBE_...")`
per role; (3) a module-level cleanup array populated in test bodies, drained
in a top-level `afterAll` via `probeSend("DELETE", ...)` with the admin
token, throwing if cleanup fails; (4) small local helpers wrapping
`probeSend` (e.g. `createOrder(token, payload)`, pushing onto the cleanup
array on success); (5) `describe`/`it` blocks grouped by capability, each
asserting one status code / field / `errorCode(...)` denial. Ticket 01's
Service Account probes and ticket 04's flow-test probes should mirror this
shape.

---

## 9. Directus config-as-code

**`scripts/directus-sync.sh`** — wraps the pinned `directus-sync`, `pull`/
`diff` only. Resolves `DIRECTUS_PROBE_ADMIN_TOKEN` from shell or `web/.env`,
re-exports as `DIRECTUS_TOKEN`, errors with instructions if absent — never
falls back to interactive auth.

- `vp run directus:pull` — refreshes `directus/config/**` from the live
  instance (pull-only: Directus is edited in its admin app or via MCP,
  never pushed back from the repo, except templates/extensions via a
  separate `directus:push`).
- `vp run directus:diff` — detects drift without writing; "clean" (ticket
  01 AC) means a `diff` right after a `pull` reports nothing.

**`scripts/directus-probe.sh`** (full):

```bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/web"
vp test run --config vitest.probes.config.ts
touch "$ROOT/.directus-probe-stamp"
```

`set -e` means the stamp (gitignored) is only touched on a fully green run.

**`scripts/check-probe-stamp.sh`** — pre-commit gate. If any file under
`directus/config/**` is staged, requires `.directus-probe-stamp` to exist
and be newer than every staged file there, else fails with "Run `vp run
directus:probe` and commit again." Wired into `vp staged` via
`vite.config.ts`'s `staged["*"]`. **Practical implication for tickets 01
and 05**: run `vp run directus:probe` green as the very last step before
`git commit` whenever the dump changes — a stale stamp from an earlier,
unrelated run doesn't satisfy the gate once a config file is touched after it.

**`directus/config/collections/permissions.json`** — flat JSON array (106
entries), one object per policy × collection × action:

```json
{
  "_syncId": "8809588a-...",
  "action": "read",
  "collection": "articles",
  "fields": ["*"],
  "permissions": null,
  "policy": "_sync_default_public_policy",
  "presets": null,
  "validation": null
}
```

`_syncId` is directus-sync's stable identity, **not** the live id —
`docs/directus.md`: "Look ids up live... before issuing a `PATCH`"
(`support.ts`'s `roleIdByName` is the established pattern). Four editable
sections per rule: `permissions` (which rows), `fields` (which columns),
`validation` (flat-payload check only — relational filters like
`folder.parent.name` don't resolve on create), `presets` (fills gaps only —
`assign({}, ...presets, payload)`, a preset never overrides a client-sent
value; spec's Further Notes repeats this for the Order's `student` preset).

**`docs/directus.md`** (read in full). Extra facts: the instance
intermittently answers `503 no available server` under rapid requests
("retry before concluding anything is broken"); three permanent test
accounts (Author, entitled/unentitled Student) plus one admin token, env
vars `DIRECTUS_PROBE_<ACCOUNT>_EMAIL`/`_TOKEN`, shared
`DIRECTUS_PROBE_PASSWORD`. Ticket 01's "one sentence... MCP edits count as
admin-app edits" belongs in the "Admin app and MCP" section near the top.

---

## 10. Sentry

**`web/sentry.server.config.ts`** (relevant excerpt):

```ts
import * as Sentry from "@sentry/nuxt"
Sentry.init({
  dsn: "https://670cc9796dc78041f2d9c234db7f9f5c@o4510533326602240.ingest.de.sentry.io/4510533327978576",
  tracesSampleRate: 1.0, enableLogs: true,
  dataCollection: { userInfo: true, cookies: true, httpHeaders: {...}, httpBodies: [...] },
  debug: false,
})
```

Auto-picked-up by the `@sentry/nuxt/module` Nuxt module, no manual wiring.

**No server-side `Sentry.captureException` call exists in the repo yet.**
Only usage found is client-side, `web/app/composables/watch-async-data-error.ts`:

```ts
Sentry.captureException(err, { tags: { asyncDataKey: key } })
```

For the notification route's "any thrown error is reported to Sentry and
answered 500" (ticket 04), the exact call by direct analogy:
`import * as Sentry from "@sentry/nuxt"` at the top of the settlement file,
then inside the `catch`, before answering 500:

```ts
Sentry.captureException(error, { tags: { gopayPaymentId: paymentId } })
```

No other server-side tagging convention exists to match against — this is
the only precedent in the codebase.

---

## 11. Vue/component conventions

**SFC structure**: `<template>` → `<script lang="ts" setup>` → optional
`<style scoped>`, every time; no non-setup `<script>` blocks observed.
Comments explain _why_, not _what_, throughout.

**Props**: `defineProps<{...}>()` destructured inline with defaults, e.g.
`const { pending = false } = defineProps<{ pending?: boolean }>()`.
`v-model` via `defineModel<T>({ required: true })`.

**Composables**: plain `ref`/`computed`, no state library observed.
Feature composables live in `<layer>/app/composables/*.ts`
(`useAuthActions`, `useAuthForm`, `useAccount`, `useEmailedToken`),
auto-imported — no explicit import statements anywhere.

**CSS**: plain CSS in `<style scoped>`, using `@lttr/puleo` design-system
custom properties (`var(--space-4)`, `var(--radius-3)`,
`var(--text-color-2)`, `var(--brand-color)`, `var(--font-size-3)`) and
utility classes used directly in templates (`p-button`, `p-button-brand`,
`p-form-group`, `p-flow`, `p-heading-3`/`p-heading-4`,
`p-secondary-text-regular`, `p-prose`). Custom media:
`@media (--md-n-above)`, `@media (--sm-n-below)` (via
`@lttr/nuxt-config-postcss`). `web/app/assets/css/main.css` is the one
site-wide override file, defining `.error-message`/`.success-message`
(the **only** notice/alert primitives in the repo — no dedicated
`<Alert>`/`<Notice>` component exists). Auth pages use these classes
directly (`<p class="success-message" role="status">`), except errors,
which go through `<AuthFormError>` (below). No success-message equivalent
wrapper exists — every success notice is inlined per page.

### Reusable components available today

| Component                                                       | Path                                                | Notes                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<PageWrapper>`                                                 | `web/app/components/PageWrapper.vue`                | Root page shell (`rootElement`/`isPageLayout` props). Used by every page read this pass, including the Sales Page and all auth pages.                                                                                                                                                |
| `<AuthPanel>`                                                   | `layers/auth/app/components/auth/Panel.vue`         | Boxed panel, title as `<h1 class="p-heading-3">`, max-width, border/shadow (collapses at `--sm-n-below`). Wraps every auth form. The prototype's actual two-column Checkout layout (`.steps`/`.two-col`/`.aside`) is custom, not `AuthPanel` — confirm fit before reusing wholesale. |
| `<AuthFormError>`                                               | `layers/auth/app/components/auth/FormError.vue`     | `<p v-if="message" class="error-message" role="alert">{{ message }}</p>` — generic enough to reuse from the shop layer, or trivially copy.                                                                                                                                           |
| `<AuthPasswordField>`                                           | `layers/auth/app/components/auth/PasswordField.vue` | `id`/`label?`/`autofocus?` props, `v-model`, bakes in the min-length hint + `aria-describedby`. Directly reusable in ticket 06's inline registration tab.                                                                                                                            |
| `<AuthSubmit>`                                                  | `layers/auth/app/components/auth/Submit.vue`        | `pending` prop, disables while pending, `p-button-brand` styling. Reusable for every Checkout submit.                                                                                                                                                                                |
| `<CourseCover>`                                                 | `layers/shop/app/components/CourseCover.vue`        | `image: Image` prop → `<NuxtImg>`, 16/9, `object-fit: cover`. Reusable in the Checkout's sticky recap and "Moje kurzy" cards.                                                                                                                                                        |
| `<CatalogCourseCard>` (`app/components/catalog/CourseCard.vue`) | `layers/shop/`                                      | Not read in full; check before building a new "Moje kurzy" card from scratch.                                                                                                                                                                                                        |
| `.p-form-group`                                                 | Puleo utility class                                 | Wraps `<label>`+`<input>`, used identically in every auth form — the convention the Billing Details form should follow verbatim.                                                                                                                                                     |
| `.p-button` / `.p-button-brand`                                 | Puleo utility classes                               | Plain vs. brand button; used directly on `NuxtLink`s/`<button>`s (no generic button component beyond submit-specific `AuthSubmit`).                                                                                                                                                  |

**Form pattern** (every auth page): `<form @submit.prevent="onSubmit">`, an
async `onSubmit` calling `submit(async () => {...}, validatorFn?)` from
`useAuthForm()`, which manages `pending`/`errorMessage`/`succeeded` and
maps thrown errors. The Checkout's three-step form (tickets 03/06) should
reuse `useAuthForm()` (or a close shop-layer variant) rather than
re-inventing pending/error state — it is already the house convention for
this exact form-then-navigate shape.

---

## Lint constraints worth knowing (root `vite.config.ts`, vite-plus config)

`check:all` = `check:lint` (oxlint via `vp check`) + `check:slowlint`
(`eslint .`) + `check:typecheck` (`nuxi typecheck`) + `check:fallow` +
`check:test` (unit only, probes excluded on purpose). Notable enforced
rules that will bite payment/checkout code specifically: `max-lines-per-function: 80`,
`max-lines: 400` per file, `complexity: 15`, `max-params: 4`,
`max-statements: 25`, `max-nested-callbacks: 3`, `typescript/no-explicit-any: error`,
`typescript/strict-boolean-expressions: error`, `typescript/no-unsafe-*: error`
(assignment/call/member-access/return/argument), `node/no-process-env: error`
(env vars must come through runtime config, not raw `process.env`, except in
`*.config.{ts,js}` files and `web/tests/**`), `no-console` (only `warn`/`error`
allowed). `settlePayment` (one function, several branches, per spec) should
be written with these caps in mind — likely needs to be decomposed into
smaller named helpers rather than one long function.

---

## Gaps found (stated explicitly, not guessed around)

- No Service Account / static-token Nitro client exists yet — ticket 01
  builds it from `createDirectusTokenClient`, the right existing seam.
- No `GOPAY_*`/`DIRECTUS_SHOP_TOKEN` runtime-config keys exist in either
  `nuxt.config.ts` or `runtime-config.schema.ts` — tickets 01 and 02 edit
  the same `privateSchema` object literal; a textual merge, not a design
  conflict.
- `layers/lms` is empty; shop-domain code does not belong there.
- No helper exists for driving flow tests against the running app's HTTP
  routes — probes only hit Directus directly, and `@nuxt/test-utils` is not
  a current dependency. Ticket 04's flow-test seam needs this resolved
  early (see §8).
- No generic `<Alert>`/`<Notice>` component — every notice is a bare
  `.error-message`/`.success-message` paragraph.
- No shop-layer error helper (`authError`'s equivalent) exists yet; writing
  one once and sharing it across tickets 03/04/05 avoids three divergent
  error shapes.
