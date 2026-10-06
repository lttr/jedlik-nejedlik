---
status: draft
references:
  - https://nuxt.com/blog/v4-6
  - https://nuxt.com/docs/4.x/getting-started/upgrade
  - "Previous upgrade, the four-pin lesson: .aiwork/2026-08-26_nuxt-4.5-toolchain-upgrade/"
  - "Release-age gate: docs/adr/0003-pnpm-native-dependency-updates.md"
  - "Session sealing (amended by this spec): docs/adr/0002-nitro-mediated-auth-sessions.md"
  - "nuxt-auth-utils not ready for Nitro v3: https://github.com/atinux/nuxt-auth-utils/issues/518"
---

# Nuxt 4.6 upgrade: `nuxt/server`, Nuxt 5 compatibility, end-to-end typed API

## Problem Statement

The site runs Nuxt 4.5.2 on vite-plus 0.3.0. Nuxt 4.6 (released 2026-10-06)
is the bridge release to Nuxt 5. It ships a rebuilt typed `$fetch`, a strict
route-path check, a server-agnostic `nuxt/server` import surface with built-in
sessions, and all Nuxt 5 defaults behind `future.compatibilityVersion: 5`.
Nuxt 3 went EOL on 2026-07-31, so 4.x is the only maintained line.

Today:

- The client calls the Nitro API with no compile-time link to the handlers.
  Six calls restate the response type by hand (`useFetch<CheckoutView>`, …),
  which is an unchecked assertion. A renamed route, a wrong method or a
  malformed body fails only at runtime.
- Server code is written against h3 v1 (`H3Event`, `event.node.req`,
  `createError({ statusCode })`). That ties it to nitropack 2. Keeping our
  `import type { H3Event } from "h3"` on v1 already needs an exact `h3` pin in
  `pnpm-workspace.yaml`.
- Sessions run on `nuxt-auth-utils`. It is h3 v1-only, reachable only through
  Nitro auto-import, and its maintainer says it is "not yet ready for Nitro v3"
  (issue #518, 2026-04-30, no activity since). The Nuxt roadmap lists an
  official `nuxt/auth-utils` as planned, with no date. As long as we depend on
  it, we can't move to `nuxt/server` or switch Nuxt 5 compatibility on, and the
  Nitro auto-import workaround in `nuxt.config` has to stay.
- Server input validation is written out seven times
  (`Schema.safeParse(await readBody(…))` plus a route error), and the client
  reports async-data errors to Sentry at only three of ~nine fetch sites.
- `@nuxt/vite-builder@4.6.0` declares `vite: ^8.3.2`, but our pinned
  vite-plus-core 0.3.0 bundles vite 8.2.2.

There is no production traffic on the account and shop features yet. So no
existing session cookie has to survive. The new session only has to work from
now on.

## Solution

Upgrade to Nuxt 4.6. Replace `nuxt-auth-utils` with `nuxt/server`'s own
sessions behind our existing session seams. Move all server code to
`nuxt/server` with explicit imports. Turn on `future.compatibilityVersion: 5`
as a whole. Make the API typed end to end.

After this:

- A typo in an API path, a wrong method or a wrongly-shaped body in a client
  call fails `vp run check:all`. Response types flow from the handler. The
  client restates none of them.
- Server code imports everything it uses explicitly from `nuxt/server` or our
  own utils, and is portable to Nuxt 5 / Nitro v3 unchanged.
- The Nuxt 5 upgrade is a version bump.
- Workarounds that only existed because of h3 v1 and auto-imports are gone.

## User Stories

1. As the maintainer, I want Nuxt at 4.6.x, so that I stay on the only maintained major line.
2. As the maintainer, I want `future.compatibilityVersion: 5` on, so that the app already runs with Nuxt 5 defaults and the major upgrade is a version bump.
3. As the maintainer, I want every server handler, middleware and util written against `nuxt/server`, so that server code runs unchanged on Nitro v2 and v3.
4. As the maintainer, I want every server-side helper imported explicitly, so that the server follows the same explicit-import convention as the rest of the codebase.
5. As the maintainer, I want `nuxt-auth-utils` removed, so that no dependency keeps us on h3 v1 or on Nitro auto-imports.
6. As the maintainer, I want the session sealed by Nuxt's own `useSession` with the root `appSecret`, so that sessions use the framework's supported mechanism.
7. As the maintainer, I want the session's data shape typed in one place, so that the account half and the secrets half can't be confused.
8. As the maintainer, I want the logged-in Account delivered to the page through SSR state, not through an extra session request, so that SSR and client agree without an internal round-trip.
9. As the maintainer, I want login to return the Account it established, so that the client sets its state from a typed response instead of re-reading the session.
10. As the maintainer, I want the cookie-header stripping hack in logout gone, so that logout is "clear the session, clear the state" and nothing else.
11. As the maintainer, I want `$fetch` calls to `/api/*` checked against the real server routes, so that a renamed or deleted endpoint fails `check:all`.
12. As the maintainer, I want a typo in an internal API path to be a type error, so that dead calls into the API can't ship.
13. As the maintainer, I want a wrong HTTP method on an internal call to be a type error, so that calling `GET` on a `.post.ts` handler is caught.
14. As the maintainer, I want request bodies typed from each handler's Zod schema, so that the client can't send a body the server would reject as malformed.
15. As the maintainer, I want no explicit response generic on any internal call, so that the client can't keep compiling against a shape the handler no longer returns.
16. As the maintainer, I want view types that only the server uses moved out of `shared/`, so that `shared/` holds only what both sides need.
17. As the maintainer, I want one validated-input helper instead of seven hand-written `safeParse(readBody(…))` blocks, so that malformed-input handling is written once.
18. As the maintainer, I want every data fetch to report its errors to Sentry by default, so that a failing Course detail or My Account fetch is visible.
19. As the maintainer, I want raw `useFetch`/`useAsyncData` disallowed in app code by lint, so that new pages can't skip error reporting.
20. As the maintainer, I want external APIs called through an explicitly imported `ofetch` instance, so that the global `$fetch` always means "our own route".
21. As the maintainer, I want the Nitro auto-import workaround removed from `nuxt.config`, so that the config no longer explains a hack.
22. As the maintainer, I want the `h3` pin removed once no code of ours imports `h3`, so that `pnpm-workspace.yaml` loses a workaround.
23. As the maintainer, I want the four coupled pins moved as one to vite-plus 1.0.0, so that the bundled vite is as close as possible to what Nuxt 4.6 declares.
24. As the maintainer, I want the unit suite green under vitest 5, so that the test gate survives the major bump.
25. As the maintainer, I want every satellite module at its newest 4.6-compatible version, so that no module holds Nuxt back.
26. As the maintainer, I want any Nuxt 5 default that a module can't cope with switched off individually, with the reason recorded, so that the gap to "pure" Nuxt 5 is a known list.
27. As the maintainer, I want CLI v4 to drive our dev, prepare and build scripts, and the agent-driven dev server, so that local dev, the pre-commit hook, the `run-jedlik-nejedlik` skill and Coolify keep working.
28. As the maintainer, I want ADR 0002 amended to describe the new sealing, so that the decision record matches the code.
29. As a Student, I want registration, e-mail verification, login, logout, password reset, password change and My Account to work, so that the change is invisible to me.
30. As a Student, I want my session to slide for 30 days and survive Directus token refreshes, so that I'm not logged out while I keep using the site.
31. As a Student, I want my Directus tokens to stay out of the browser, so that the ADR 0002 guarantee holds.
32. As a buyer, I want the Catalog, Course detail and mock-GoPay checkout to work, including the pending-checkout resume after login, so that I can still buy a Course.
33. As a visitor, I want public pages, SEO meta, the sitemap, robots, the 404 and error pages and analytics consent to behave as before, so that search presence and consent guarantees are unchanged.
34. As the maintainer, I want each logical step as its own commit on a branch, so that a regression bisects to one step.

## Implementation Decisions

### Timing

- `nuxt@4.6.0` is younger than pnpm's 24-hour `minimumReleaseAge` today. Per ADR 0003, implementation starts when the gate opens (2026-10-07 or later). Don't add a `minimumReleaseAgeExclude` entry. Take the newest 4.6.x patch available on the day.

### Versions

- `nuxt` → `^4.6.x`. `vue-router` stays on `^5.3.1` and `vue` on 3.5.x.
- The four coupled pins move as one: `vite-plus` 1.0.0, the core alias `@voidzero-dev/vite-plus-core@1.0.0` (vite 8.3.1, rolldown 1.2.11), `rolldown` 1.2.11 and `vitest` 5.0.1. Update the numbers in the `pnpm-workspace.yaml` comment too. Apply what the vite-plus 1.0 and vitest 5 release notes require.
- Satellite modules move to their newest 4.6-compatible versions, in their own commit.
- `nuxt-auth-utils` is removed.
- TypeScript stays on 5.9.x.

### Sessions: `nuxt/server` instead of `nuxt-auth-utils`

The swap happens behind the two seams that already exist: the server session store and the client `useAccount` composable. Pages and route handlers speak `Account`/`AccountSecrets` and don't change their vocabulary.

- **Server seam (session store).** Keeps its three operations (read, write, drop), now on `nuxt/server`'s `useSession`. The session data is one typed object holding the `Account` and the `AccountSecrets`. The `#auth-utils` type augmentation and its lint exemption are deleted. The cookie keeps today's settings: `httpOnly`, `secure`, `sameSite: lax`, 30-day `maxAge`. The settings move from `runtimeConfig.session` into the seam. The cookie name stays Nuxt's default unless a collision shows up.
- **Sliding window.** Today's `replaceUserSession` trick exists because h3 v1 derives expiry from creation time. With `nuxt/server`, check that every token refresh re-seals the session with a fresh `maxAge`, so the 30 days still slide. Unit-test it at the seam.
- **Secret.** Sealing uses the default password derived from `runtimeConfig.appSecret` (`NUXT_APP_SECRET`). `NUXT_SESSION_PASSWORD` is retired. Locally, Nuxt generates a dev secret. **Production needs `NUXT_APP_SECRET` set in Coolify before the deploy**, because production never generates one. The maintainer sets it (a string, at least 32 characters, `openssl rand -base64 32`) and removes `NUXT_SESSION_PASSWORD`.
- **Client seam (`useAccount`).** Has no session endpoint and no `useUserSession`. The account middleware already resolves the session on every page request. It puts the `Account` (never the secrets) on the request context, and a server-side app plugin moves it into `useState`. So SSR and client share one payload value with no internal fetch. `refresh()` goes away:
  - login returns the `Account`, and the client sets the state from that typed response;
  - logout returns no content, and the client clears the state;
  - password change keeps the identity and touches no state.
- **Logout hack removed.** The incoming `Cookie` header was only stripped because the module re-read the session through an internal SSR fetch. With no internal fetch, it goes.
- **ADR 0002 amendment.** Replace "sealed by `nuxt-auth-utils`" with Nuxt's `useSession` and `appSecret`. The e-mail is no longer in a client-readable cookie payload: it reaches the browser through the SSR payload. The decision itself (Nitro-mediated sessions, tokens never in the browser) is unchanged.

### Server code on `nuxt/server`

- Every handler, middleware and server util imports `defineEventHandler` and the helpers explicitly from `nuxt/server`. `H3Event` becomes `RequestEvent`. Our own code imports nothing from `h3`. Mixing h3's `defineEventHandler` with `nuxt/server` helpers is the `NUXT_E8012` 500, so convert a file completely in one go, never half.
- Apply the behaviour differences listed in the upgrade guide:
  - `createError` takes `status`/`statusText`;
  - `sendRedirect` returns the response, so the handler must return it;
  - `getRouterParam` doesn't decode by default (decide per route; Course slugs are ASCII);
  - `useRuntimeConfig()` takes no event;
  - `event.node.req` becomes `event.req` (a web `Request`);
  - response headers go through `event.res.headers`;
  - `sendNoContent` becomes whatever 204 form `nuxt/server` offers, or a returned empty `Response`.
- Auth error replies keep their status codes and bodies, which `auth-errors.test.ts` pins. With Nuxt 5 defaults, server routes always answer errors as JSON, which is what the auth client already expects.
- `getDirectusServerClient(event)` and the shop service client take `RequestEvent`. ADR 0006 is unchanged.

### One validated-input helper

- One helper in the `base` layer's server utils, with a body variant and a query variant. It takes a Zod schema and the route's own error, and returns the parsed value or throws that error.
- It is built on `nuxt/server`'s `readValidatedBody`/`getValidatedQuery`, which accept Standard Schema (Zod 4 qualifies), so that `routeTypedFetch` infers request bodies at call sites.
- It replaces `readAuthBody` and the inline blocks in the billing, checkout, mock-GoPay and GoPay-notify handlers.
- A malformed body still reveals no more than that route's real failure would.
- First-ticket spike: check whether body inference survives the wrapper. If it needs a direct `readValidatedBody` call in the handler, handlers call it directly and the helper shrinks to mapping the error.

### Typed API end to end

- `experimental.routeTypedFetch` and `strictRouteTypes` come with compatibility 5. Set them explicitly anyway, so the intent is visible in the config. `typedPages` stays on. Decide on `isomorphic` mode during implementation and record the decision in notes.
- Remove every explicit response generic on an internal call. A type error after removal is real drift: fix it in the handler or the component.
- View types that only the server uses after that (likely `CheckoutView`, `SettlementView`, `OwnedCourse`) move from `shared/` into the layer's server utils. Confirm with `fallow`.
- Each handler, or the util it delegates to, keeps an explicit return type. That annotation is the route's contract.
- Dates arrive as strings in serialised responses. If a page needs a `Date`, it parses one. Don't cast.
- External HTTP (GoPay) uses an explicitly imported `ofetch` instance. The global `$fetch` is for our own routes.

### Async-data error reporting by default

- A 4.6 fetch add-on reports errors to Sentry with the call's key. Expose it through `createUseFetch`/`createUseAsyncData` as project composables in the `base` layer.
- Raw `useFetch`/`useAsyncData` are disallowed in app code by a lint rule.
- `watchAsyncDataError` and its three call sites are deleted.
- If the factories lose route typing, keep route typing and fall back to plain `useFetch` plus the add-on, or the current watcher.

### Nuxt 5 compatibility as a whole

- Turn on `future.compatibilityVersion: 5`.
- When a module breaks under one specific default, switch that one default off with its own flag. Give the flag a comment naming the module and the condition for removing it, and collect these opt-outs in notes as the Nuxt 5 gap list. Never turn compatibility 5 off as a whole.
- On 4.6, compatibility 5 resolves (per the `@nuxt/schema@4.6.0` source) to more than the blog post lists. The two that matter for modules:
  - `experimental.nitroAutoImports: false`, which makes `@nuxt/nitro-server` pass `imports: false` to Nitro. In nitropack 2.13.4 that removes unimport entirely, including the `#imports` virtual module in the server build.
  - `experimental.viteEnvironmentApi: true`.

  It also turns off `vue.optionsApi` and `unhead.legacy` and the PostCSS `autoprefixer`/`cssnano` defaults, and turns on `typedPages`, `routeTypedFetch`, `payloadExtraction: 'client'`, `inlineErrorRendering`, case-sensitive routing, `normalizePageNames`, `clientNodePlaceholder` and `watcher: 'builder'`. It also drops `baseUrl` from the generated tsconfig.

- Defaults that need a deliberate check, not just a green build:
  - **Case-sensitive routing:** no inbound link, redirect or Directus-stored path may rely on case folding.
  - **`navigateTo` early return:** audit the middleware for code that runs after a redirect.
  - **Comment placeholders for client-only components:** check the layout at 375px.
  - **Unhead legacy plugins off, Capo sorting on:** confirm that the SEO meta and the script order in `<head>` are unchanged.
  - **Inline error rendering and the payload-extraction default:** check the 404 and error pages, and that auth cookies survive an error render.

### Module compatibility with compatibility 5 (audited 2026-10-06)

Static audit of each module's latest tarball and its GitHub issues and PRs. Nothing was built or run, because Nuxt 4.6.0 is still inside the release-age gate. The GitHub search hit rate limits, so for some repos only the 100 most recently updated issues were checked. **Result: no module is known to break with this project's configuration. One is likely to (Sentry), and two of our own files need explicit imports.**

| Module (latest)                                                                                                                                                        | Verdict          | Why                                                                                                                                                                                                                                                                                                                                                                                                           | Action                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sentry/nuxt` 11.4.0                                                                                                                                                  | **Likely break** | Its build step wraps every scanned server middleware with `import { wrapMiddlewareHandlerWithSentry } from '#imports'` (it switches to `#imports/server` only on Nitro 3). With Nitro imports off, `#imports` doesn't exist on nitropack 2. We have two server middlewares (account session, pending checkout). The Options API mixin issue under compatibility 5 is fixed (getsentry #23462/#23375, 11.0.0). | Build first. If it fails, the only opt-out is `experimental.nitroAutoImports: true`, with the comment "DELETE WHEN `@sentry/nuxt` emits `#imports/server` or explicit imports on Nitro 2". Our code still imports explicitly. Consider reporting it upstream.                                               |
| `@nuxtjs/seo` 5.3.16 and sub-modules (robots 6.2.4, sitemap 8.6.1, site-config 4.2.3, schema-org 6.4.3, seo-utils 8.6.1, link-checker 5.3.0, og-image 6.10.3 disabled) | OK               | Server runtime imports explicitly from `nitropack/runtime`. All `.vue` files use `<script setup>`. Nuxt 5 / Nitro v3 PRs are merged upstream.                                                                                                                                                                                                                                                                 | **Project side:** `__sitemap__/courses.get.ts` uses the auto-imported `defineSitemapEventHandler`, and `auth-urls.ts` uses `getSiteConfig`. Import both explicitly through the modules' aliases (`#sitemap/server/composables/…`, `#site-config/server/composables/…`), and check that the aliases resolve. |
| `@nuxt/scripts` 1.3.12                                                                                                                                                 | OK               | No `#imports` on the server. It has its own Nitro 2/3 alias layer and nothing Vite-environment-specific.                                                                                                                                                                                                                                                                                                      | None                                                                                                                                                                                                                                                                                                        |
| `@nuxtjs/plausible` 4.0.0                                                                                                                                              | OK               | Its only `#imports` on the server is in the proxy handler, which we don't enable (`proxy` unset). It is production-only, so verify it on a production build.                                                                                                                                                                                                                                                  | None                                                                                                                                                                                                                                                                                                        |
| `@nuxt/image` 2.1.0                                                                                                                                                    | OK for us        | IPX handler and server `useImage` import from `#imports` (open nuxt/image#2205), but neither is registered with the `directus` provider.                                                                                                                                                                                                                                                                      | None. If IPX is ever enabled, it needs `nitroAutoImports: true`.                                                                                                                                                                                                                                            |
| `@nuxt/fonts` 0.14.0, `@nuxt/icon` 2.5.1, `nuxt-svgo` 5.3.0                                                                                                            | OK               | Vite hooks still fire under the Environment API. Icon's compatibility 5 issues (#467, #512) are fixed. svgo's `NuxtIcon` uses the Options API for props only, and we don't use it.                                                                                                                                                                                                                            | None                                                                                                                                                                                                                                                                                                        |
| `@vueuse/nuxt` 15, `@dxup/*`, `@nuxt/eslint` 1.17                                                                                                                      | OK               | No Nitro auto-imports to lose, and nothing reads `baseUrl`. ESLint's server globals list shrinks, which is correct.                                                                                                                                                                                                                                                                                           | None                                                                                                                                                                                                                                                                                                        |
| `@nuxt/devtools` 3.4.2                                                                                                                                                 | Check in dev     | The Vite plugin already uses `applyToEnvironment`. It is dev-only.                                                                                                                                                                                                                                                                                                                                            | Open the devtools panel once. If it breaks, opt out with `viteEnvironmentApi: false` in dev only. **Stay on 3.x**; npm `latest` now points at the 4.0 betas.                                                                                                                                                |
| `@lttr/nuxt-config-postcss` 0.0.8                                                                                                                                      | OK               | It overwrites `postcss` itself (`autoprefixer: false` because `postcss-preset-env` prefixes, and cssnano on), so the Nuxt 5 PostCSS defaults never apply.                                                                                                                                                                                                                                                     | None. This replaces the PostCSS check above.                                                                                                                                                                                                                                                                |
| `@lttr/nuxt-validated-runtime-config` 0.1.2                                                                                                                            | OK on 4.6        | It imports explicitly from `nitropack/runtime`. It will break on real Nuxt 5 / Nitro v3 (`nitropack/runtime`, peer `^3 \|\| ^4`).                                                                                                                                                                                                                                                                             | Gap list: a release for Nuxt 5 is needed before the major. We own it.                                                                                                                                                                                                                                       |

Upcoming, but **not** part of this spec:

- The SEO suite merged "require Nuxt 4.6 and native request APIs" majors on 2026-10-06 (sitemap #687, robots #333, site-config #121, …). They aren't published yet.
- `@nuxt/scripts` 2.0 is in beta.
- Each of these is a separate upgrade once released and past the release-age gate.

### Workarounds removed

- The Nitro `imports.dirsScanOptions` filter in `nuxt.config` is removed. Compatibility 5 turns Nitro auto-imports off. Exception: if Sentry forces the `nitroAutoImports: true` opt-out (see the module audit), the filter stays until that opt-out goes. Lint for bare server names takes over the job auto-imports did.
- The `h3` exact pin in `pnpm-workspace.yaml` is removed once our code imports nothing from `h3` and `check:typecheck` stays green without it. If typecheck still breaks, keep the pin and rewrite its DELETE-WHEN note to say what still breaks.
- Re-check the vite-plus `overrides`/`peerDependencyRules` workarounds against the new tree. Update their comments.

### CLI v4 and deploy

- Check `nuxi dev`/`build`/`prepare` under CLI v4. Switch the `web/` scripts to the `nuxt` binary if `nuxi` is deprecated. The `dev:agent` script and the `run-jedlik-nejedlik` skill must still start the server without the interactive panel blocking.
- Check that Coolify's Node 24 resolves to ≥ 24.15.0. Pin it if it doesn't.
- Rollback means reverting the merge on `master`. `NUXT_SESSION_PASSWORD` stays in Coolify until the deploy is confirmed healthy, so a revert still has its secret.

## Testing Decisions

- Good tests check behaviour at the seams: the gate is green, the real app runs the real flows, and the session seam does what the Account flows need. They don't test `nuxt/server` itself.
- **Seam 1, static: `vp run check:all`.** Includes a negative check: temporarily misspell one `/api/*` path, use one wrong method and send one wrong body shape. Confirm each fails typecheck, then revert. Record the three errors in notes.
- **Seam 2, the session store.** New unit tests: write then read returns the same `Account` and `AccountSecrets`; drop then read returns neither; a rewrite renews the cookie's expiry (the sliding window); the secrets never appear in what the client seam exposes. Prior art: `rate-limit.test.ts` and `pending-checkout.test.ts` build server events in tests, so adapt them to `RequestEvent` built from a web `Request`.
- **Seam 3, the validated-input helper.** A valid body passes through, a malformed body throws the route's own error unchanged, and a non-JSON body behaves like a malformed one. Prior art: `auth-errors.test.ts`.
- **Seam 4, the existing unit suite under vitest 5.** Only adapt for vitest 5 and the `RequestEvent` shape. Never loosen an assertion.
- **Seam 5, behaviour: the `verify` skill.** Drive registration → verify e-mail → login → My Account → billing save → password change → logout → password reset. Then drive Catalog → Course detail → mock-GoPay checkout → order return, including logging in mid-checkout (pending-checkout resume). Also check a 404, an error page and an uppercase-slug URL. Screenshot at 375px and desktop. Confirm in the browser's devtools that the session cookie is `httpOnly` and that no Directus token is anywhere in the page payload.
- **Seam 6, build and deploy.** Run `vp run build`. Confirm `NUXT_APP_SECRET` is set in Coolify, push, then run `monitor-deploy`. After that, smoke-test production: the homepage, `sitemap.xml`, `robots.txt` and one login.

## Out of Scope

- Vue Vapor (needs Vue 3.6 rc).
- `@nuxt/vite-server` (`server.builder: 'vite'`).
- Payload tuning (`serialize: false`, `stripNeverHydratedData`).
- TypeScript 7 / tsgo.
- Server-side session storage, session revocation lists and any new auth feature. This spec swaps the session mechanism and nothing else.
- Directus schema or permission changes.

## Open Concerns

- `@sentry/nuxt` will likely fail to build with Nitro auto-imports off (its middleware wrapper imports from `#imports`). The planned fallback is the single `nitroAutoImports: true` opt-out. Whether to also report it upstream to getsentry/sentry-javascript is the maintainer's call.

- `@nuxt/vite-builder@4.6.0` declares `vite: ^8.3.2`, and vite-plus 1.0.0 bundles 8.3.1. The override forces the gap. If dev, build or HMR break on it, the maintainer decides whether to wait for a vite-plus patch.
- vitest 4 → 5 rides along with the vite-plus pin. If it turns into its own project, the maintainer decides whether to split it out and do the rest on vite-plus 0.3.x (rolldown 1.2.5 still satisfies Nuxt's `~1.2.1`).
- Before deploy, the maintainer sets `NUXT_APP_SECRET` in Coolify (production). This spec can't do it, and the session fails closed without it.

## Further Notes

- Nuxt's roadmap plans an official `nuxt/auth-utils`, built on 4.6's `appSecret`/`deriveSecret` (the `deriveSecret` docs use `'nuxt-auth-utils:session'` as the example). When it ships, check it for OAuth or passkeys if those features ever come up. Password login on `useSession` doesn't need it.
- The typed-fetch rebuild keeps type instantiations roughly flat as routes grow. Still, record `check:typecheck` wall time before and after.
- The weekly dependency routine must not pick this up. It lands through this spec's branch.
- Suggested commit order:
  1. toolchain pins;
  2. Nuxt 4.6 plus modules;
  3. session swap;
  4. `nuxt/server` migration plus input helper;
  5. typed API (flags, generics, `ofetch`);
  6. async-data add-on;
  7. compatibility 5 plus opt-outs;
  8. workaround removal;
  9. ADR 0002 amendment and spec `status: done`.
