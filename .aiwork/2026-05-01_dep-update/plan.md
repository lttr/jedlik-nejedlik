# Dependency Update Plan — 2026-05-01

Source notes: `./release-notes.md`

## Breaking changes (majors)

- **@nuxtjs/seo 3 → 5** — Site Config v4. Removes implicit site name, legacy `site*` runtime keys, deprecated server APIs. OG Image v6 needs migration CLI. Guide: https://nuxtseo.com/docs/nuxt-seo/migration-guide/v4-to-v5
- **eslint 9 → 10** — drops eslintrc, Node `^20.19.0 || ^22.13.0 || >=24`, drops jiti <2.2, removes deprecated SourceCode/rule-context APIs, `no-shadow-restricted-names` now reports `globalThis`, `eslint-env` comments → errors, new `eslint:recommended` defaults. Guide: https://eslint.org/docs/latest/use/migrate-to-10.0.0
- **vue-router 4 → 5** — boring; merges `unplugin-vue-router` into core. App code unaffected.
- **nuxt 4.2 → 4.4.4** — minor; pulls vue-router 5 + `useAnnouncer`. Drop-in.
- **@nuxtjs/plausible 2 → 3** — moved to `@plausible-analytics/tracker`. Adds outbound link / download / form tracking. Verify config in `nuxt.config.ts`.
- **nuxt-svgo 4 → 5** — ESM-only (Nuxt unaffected). svgo v4.
- **@eslint/css 0.14 → 1.2** — ESM-only, Node `>=20.19.0`. `/types` export removed (types from main).
- **@nuxt/devtools 3 → 4.0.0-alpha.4** — SKIP (alpha).
- **@directus/sdk 20 → 21** — notes not scraped. Verify https://github.com/directus/directus/releases?q=%22sdk+21%22 before merge. App uses `readItems()`/`readItem()` only.
- **eslint-plugin-baseline-js 0.4 → 0.6** — drops ESLint 8 (we're on 9), ESM-only (transparent). +9 Web API features.

## Safe batch (minor/patch)

`@nuxt/eslint`, `@nuxt/icon`, `@sentry/nuxt`, `@vueuse/core`, `@vueuse/nuxt`, `vue-tsc`, `@dxup/nuxt`, `@lttr/nuxt-config-eslint`, `@nuxt/fonts`.

## Upgrade order

1. Verify Node `>=20.19.0`.
2. Safe batch:
   ```
   vp update -r @nuxt/eslint @nuxt/icon @sentry/nuxt @vueuse/core @vueuse/nuxt vue-tsc nuxt @dxup/nuxt @lttr/nuxt-config-eslint @nuxt/fonts eslint-plugin-baseline-js
   ```
3. vue-router 5 + nuxt-svgo 5:
   ```
   vp update -r vue-router nuxt-svgo
   ```
4. eslint stack:
   ```
   vp update -r eslint @eslint/css
   vp run lint
   ```
5. Directus SDK 21 (read changelog first):
   ```
   vp update -r @directus/sdk@21
   vp run typecheck
   ```
6. Plausible 3 (verify analytics config):
   ```
   vp update -r @nuxtjs/plausible
   ```
7. SEO 5:
   ```
   npx nuxt upgrade --dedupe
   vp update -r @nuxtjs/seo
   ```
   Then OG Image v6 migration CLI per release notes.
8. Skip @nuxt/devtools (alpha).
9. Verify:
   ```
   vp run typecheck && vp run lint && vp run build
   ```

## Open questions

- Directus SDK 21 breaking changes — release notes missing from scrape. Confirm via npm/changelog before step 5.
- Current Node version on prod (Coolify) — confirm `>=20.19.0` before bumping eslint/css.
- SEO v5 site config: any usage of legacy `site*` runtime config keys in `nuxt.config.ts` or `useRuntimeConfig()`?
