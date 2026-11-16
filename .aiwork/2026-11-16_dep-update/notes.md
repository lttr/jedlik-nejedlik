# Dependency update 2026-W47

Scan (after `pnpm install --frozen-lockfile` synced a stale container `node_modules`): 18 outdated (15 in scope, 5 major, 3 out of scope).

Bumped (non-Nuxt-group minors/patches): @iconify-json/logos 1.2.19→1.2.20, @sentry/nuxt 11.11.0→11.12.0, eslint 10.14.0→10.15.0, fallow 3.41.0→3.43.1.

Deferred:

- Nuxt group (indivisible), third week running: nuxt 4.6.4, vue 3.5.45, vue-router 5.5.1, @nuxt/icon 2.6.2, @nuxt/image 2.2.1, @nuxtjs/plausible 4.1.0, plus majors @nuxt/devtools 4, @nuxt/fonts 1, @nuxtjs/seo 6, and the toolchain set (vite-plus 1.6.0 / rolldown 1.3.2). Too large for a batch; needs a dedicated migration run.
- @directus/sdk 26→27: still no usable release notes (no GitHub access to directus/directus this session, npm page 403, Directus breaking-changes page lists no SDK entries).
- typescript 5.9→7.0: major, vue-tsc/toolchain implications, not reviewed.

Reported, not touched: vite-plus 1.1.0→1.6.0, rolldown 1.2.12→1.3.2 (three-row exact-pin set).

DELETE-WHEN: `vite@*` override and `peerDependencyRules` ("Nuxt ships vite-plus compat") — not satisfied; no Nuxt release read this run, @nuxt/vite-builder 4.6.1 still installed.

Hoist skew: h3 1.x/2.x, tsconfig paths → 1.15.11 = hoisted root. ofetch: only 1.5.1 installed now (no second major). Root `node_modules/vite` now points at vite-plus-core 1.1.0, no longer upstream vite 7.3.2 (7.3.2 is still in the tree as a peer key).

Outcome: `vp run check:all` green.
