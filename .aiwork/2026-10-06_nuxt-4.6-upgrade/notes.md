# Notes: Nuxt 4.6 upgrade

## Step 2: Nuxt 4.6 plus modules (2026-10-12)

- `nuxt` 4.6.1 (published 2026-10-09, past the release-age gate), `vue-router` 5.4.0,
  `@sentry/nuxt` 11.6.0, `@types/node` 26.6.5, `eslint-plugin-baseline-js` 0.7.4
  (0.7.5 exists but is inside the gate), `fallow` 3.33.1, `vue-tsc` 3.3.13.
- Not taken: `@directus/sdk` 27 (major, not this spec), `@nuxt/devtools` 4 beta,
  `typescript` 7, `h3` 2.
- `vue-tsc` stays. `nuxi typecheck` resolves `vue-tsc/bin/vue-tsc.js` at
  runtime (CLI v4 `typecheck` command), so fallow can't see the use. It's now in
  `ignoreDependencies`.
- `check:typecheck` wall time before the upgrade: 6.8 s (`nuxi typecheck`, warm).

### CLI v4

- `@nuxt/cli` 4.0.1. `nuxi` isn't deprecated: `nuxi`, `nuxt` and `nuxt-cli` are
  all bins of the same entry. The scripts stay on `nuxi`.
- `nuxt dev` shows the TUI panel only in an interactive terminal. It falls back to
  plain logs when stdout isn't a TTY, so `dev:agent` (piped into `grep`) is
  unaffected. `--no-tui` / `NUXT_TUI=plain` would force it.
- Engines: Nuxt 4.6.1 needs Node `^22.22.3 || ^24.15.0 || >=26`. CLI v4 needs
  `^24.11.0`.

### Coolify Node version

- The last production build used Nixpacks `nodejs_24` from nixpkgs
  `23f9169c…`, which is **24.10.0**. That fails both ranges.
- Pinned `[phases.setup] nixpkgsArchive` to nixos-26.05 `6fcc1603…`
  (`nodejs_24` = 24.21.0; `pnpm_9`, which Nixpacks also asks for, still exists
  there). Pnpm itself still comes from corepack.

## Step 3+4: session swap and `nuxt/server` migration (one commit)

- **Steps 3 and 4 landed together.** `nuxt/server`'s session helpers refuse an
  h3 event (`NUXT_E8012`), and every caller of the session store is a handler or
  middleware. So the store can only move once its callers do. Splitting would
  have meant a throwaway cast over `nuxt-auth-utils`. The input helper stays a
  commit of its own.
- **Session store** (`auth/server/utils/session-store.ts`): `getSession`,
  `updateSession` and `clearSession` from `nuxt/server`, default password
  (derived from `appSecret`), cookie `nuxt-session`, 30-day `maxAge`, `httpOnly`,
  `secure`, `sameSite: lax`. One typed object `{ account?, secrets? }`.
  - `getSession` on a request **without** a cookie mints an empty session and a
    `Set-Cookie`. The store now guards its own read, so the two middlewares no
    longer read the cookie name from `runtimeConfig.session`.
  - Sliding window: every `updateSession` re-seals with a fresh iron TTL and
    cookie `Max-Age`. Unit-tested (`session-store.test.ts`): rewritten on day
    20, still alive on day 40; the cookie from login is dead by then.
- **Client seam:** the `account-session` middleware puts `account` (never the
  secrets) on `event.context`, typed through a `RequestEventContext`
  augmentation. `auth/app/plugins/account.server.ts` moves it into
  `useState("account")`. Login returns the `Account`, logout `null`/204. The
  `refresh()` and the cookie-header stripping are gone.
  - The middleware reads the Account **after** the refresh attempt, so a
    session Directus refused renders logged out. If Directus is unreachable,
    the stored Account still renders (an outage doesn't log anyone out).
- **204:** `nuxt/server` has no `sendNoContent`. `base/server/utils/no-content.ts`
  sets 204 and returns `null`. h3 v1 answers `null` with 204 by itself; h3 v2
  sends an empty body with the status that was set.
- **Errors:** `createError({ status, statusText, message })`. On nitropack 2,
  `nuxt/server`'s `createError` maps them onto h3's `statusCode`/`statusMessage`,
  so the JSON body is unchanged. Checked live: a wrong password still answers
  `401 {"statusMessage":"invalid_credentials","message":"Neplatný e-mail nebo heslo."}`.
- **Event parameters dropped** where only `useRuntimeConfig(event)` used them:
  `getDirectusAnonymousServerClient()`, `getShopServiceDirectusClient()`.
- **`authPageUrl(path)`** builds on the base layer's `SITE_URL` instead of
  `getSiteConfig(event)`. `getSiteConfig` is typed for h3's `H3Event`, and
  `site.url` is set from that same constant, with no environment override
  anywhere. This deviates from the spec's "import it through
  `#site-config/...`".
- **Sitemap source** uses `nuxt/server`'s `defineEventHandler` (returning
  `string[]`) instead of the auto-imported `defineSitemapEventHandler`, which
  is h3's `defineEventHandler` under another name. This deviates from the
  spec's "import it through `#sitemap/...`". `sitemap.xml` still lists the
  published Course.
- **`routeTypedFetch: true` arrived in this commit, not step 5.** With the
  login response used, oxlint's type-aware pass hit `TS2321 Excessive stack
  depth` on nitro's legacy `InternalApi` typing for `$fetch("/api/auth/login")`.
  The rebuilt route typing has no such problem. That in turn rejected GoPay's
  external `$fetch` (`"GET"` isn't a route method), so the `ofetch` instance
  came forward too (`ofetch` declared in `web/`, `^1.5.1` like Nuxt's own).
- **Tests:** `rate-limit.test.ts` now drives a `RequestEvent` built from a web
  `Request` (`tests/unit/request-event.ts`) instead of stubbing h3 globals.
  `gopay-api-client.test.ts` mocks `ofetch` instead of `globalThis.$fetch`.
  The unit config inlines `nuxt/dist/server` so a test can mock
  `nuxt/internal/server-runtime-config` (outside a Nuxt build it's an empty
  stub, and Node-resolved modules ignore `vi.mock`).
- **Live check (dev, curl):** login 200 → `{email}` with
  `Set-Cookie: nuxt-session=Fe26.2…; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax`;
  `/muj-ucet` SSR 200 shows the e-mail, and no token string appears in the
  HTML/payload; `/api/account/{courses,billing}` 200; logout 204 with
  `nuxt-session=; Max-Age=0`; `/muj-ucet` after that 302. Anonymous `/` sets
  no cookie.
- **Not changed, worth knowing:** most of the auth utils keep an `event`
  parameter that now goes unused (it only fed the anonymous client). Left in
  place to keep this commit's diff to the migration.

## Step 4b: one validated-input helper

- **Spike result: body inference doesn't survive, with or without a wrapper.**
  `routeTypedFetch` types a route's `body` as `RequestBodyOf<typeof handler>`
  (`@nuxt/nitro-server/dist/request-types.d.mts`). That reads the request shape
  from an **h3-typed** handler, `(event: H3Event<{ body }>) => …`. A
  `nuxt/server` handler is `(event: RequestEvent) => R` and carries no request
  type, so `body` is `never` (permissive) for every route of ours. Calling
  `readValidatedBody` directly in the handler changes nothing: the type comes
  from the handler's signature, not from what it calls. Getting it back on 4.6
  would mean typing handlers against h3 v1 again, which undoes step 4. User
  story 14 is **not met on Nuxt 4.6**. Expect it from Nitro v3 / Nuxt 5, where
  the event type is h3 v2's.
- So the helper isn't built on `readValidatedBody`. That function's `onError`
  must return error _details_, while our routes already own a constructed
  error (and checkout picks one from the failing field). The helper is
  `readValidBody(event, schema, invalid)` in
  `base/server/utils/valid-body.ts`: `readBody` + `safeParse`. `invalid` is the
  route's `Error`, or a function from the `ZodError` to one.
- It replaces `readAuthBody` (6 auth readers) and the inline blocks in
  billing, checkout, mock `payments` and mock `decide`.
- **No query variant.** The only query read, GoPay notify, answers an invalid
  query with `200 {"status":"ignored"}` on purpose (GoPay must not retry), not
  with an error. A throwing query helper would have no caller.
- Tests: `valid-body.test.ts` (valid passes; missing field, wrong type, empty,
  non-JSON and truncated JSON all reject with the same error instance; the
  function form sees the failing path).
- Live: mock `payments` with a bad body → 400 `Invalid payment` and the
  prettified issues; `decide` with non-JSON → 400; `password-request` with
  non-JSON → 400 `invalid_email`.

## Step 5: typed API

- `experimental.strictRouteTypes: true` next to `routeTypedFetch: true`
  (in since step 3+4), both commented as "comes with compatibility 5, set for
  intent". `typedPages` stays.
- **`isomorphic`: no.** Nothing `$fetch`es a page path, so typing pages as
  `GET → string` routes would constrain nothing.
- All six explicit response generics are gone (`Billing`, `MyCourses`,
  `OrderForm`, the Checkout page, the return page, `takePendingCheckoutSlug`).
  Typecheck stayed green without them, so there was no drift to fix, and no
  page parses a date.
- Moved out of `shared/` (now server-only): `CheckoutView` →
  `server/utils/checkout-order.ts`, `SettlementView` → `order-return.ts`,
  `SalesView` → `course-query.ts`, `OwnedCourse` + `parseOwnedCourses` →
  `entitlements.ts`. Fallow can't tell which side imports a type, so this was
  decided with grep: no importer under `app/` remained. `CatalogCourse`,
  `BillingDetails`, `SalesCourse`/`SalesSection` and `SettlementState` stay
  shared because components use them.
- `typecheck` wall time after (warm, `nuxi typecheck`): see Step 7.

### Negative check (Seam 1)

Temporarily in `auth/app/composables/auth.ts`, then reverted:

| Change                                                                         | Result                                                                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `$fetch("/api/auth/registr", { method: "POST" … })`                            | `TS2769 … "fetchdts: no POST route matches '/api/auth/registr'"`                                    |
| `$fetch("/api/auth/verify-email", { method: "GET" })`                          | `TS2345 … "fetchdts: no GET route matches '/api/auth/verify-email'"`                                |
| `$fetch("/api/auth/password-request", { method: "POST", body: { mail: 42 } })` | **no error.** As predicted in step 4b, `nuxt/server` handlers carry no request type on nitropack 2. |

## Step 6: async-data errors reported by default

- `base/app/composables/reported-fetch.ts`: `useReportedFetch = createUseFetch({ addons })`
  and `useReportedAsyncData = createUseAsyncData({ addons })`. Each add-on
  pushes an async-data **middleware** that reports a rejection and rethrows. So
  a failure is reported once, where the fetch ran (server or browser). The old
  watcher reported again on hydration.
- **What is reported:** no status (network, crash) or ≥ 500. A 4xx is the
  page's own answer (draft Course 404, Checkout 409, expired session 401) and
  isn't reported. Aborts aren't reported either.
- **Key:** the fetch add-on tags `asyncDataKey` with the call's `key`, or the
  request URL when there is none. **An add-on never sees `useAsyncData`'s
  positional key** (only `{ signal }` reaches middleware, and the key isn't merged
  into the options), so the two `useReportedAsyncData` callers tag
  `useAsyncData`. Stack and route still place them.
- Route typing survives the factory: typecheck stayed green on every call
  site, so no fallback to raw `useFetch` was needed.
- `watchAsyncDataError` and its three uses are deleted. All 10 call sites moved.
- Lint: `no-restricted-globals` bans `useFetch`, `useLazyFetch`,
  `useAsyncData` and `useLazyAsyncData` in `web/app/**` and `web/layers/**/app/**`.
  Proved on a `.ts` and a `.vue` probe.
- Live: a forced throw in `/api/courses` → `/kurzy` still 200 (its empty
  state) and the dev log shows `[async-data:catalog] [GET] "/api/courses": 500`.
  `/kurzy/neexistuje` 404 → not reported.
