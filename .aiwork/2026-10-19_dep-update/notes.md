# Dep update 2026-W43

Scan: 17 outdated (14 in scope, 3 report-only, 4 majors).

Bumped: @eslint/css 2.0.1, @iconify-json/logos 1.2.16, eslint 10.13.0, eslint-plugin-baseline-js 0.7.5, @sentry/nuxt 11.8.0, zod 4.6.7, fallow 3.34.0.

Deferred:

- Nuxt group (nuxt 4.6.2, @nuxt/devtools 3.4.3, vue 3.5.44, @nuxt/fonts 1.0.1, @nuxtjs/seo 6.0.1): indivisible, and the two majors' release notes were unreachable (GitHub access to those repos not enabled), so the whole group waits.
- @directus/sdk 26 → 27: major, release notes unreachable.
- typescript 5.9.3 → 7.0.2: major, native compiler rewrite, needs its own migration PR.

Report only: rolldown 1.2.12 (pin; 1.2.14 available), vite-plus 1.1.0 (catalog; 1.3.0 available). Move together with vite/vite-plus catalog rows.

DELETE-WHEN: both pnpm-workspace.yaml conditions ("Nuxt ships vite-plus compat") not satisfied; not evaluated against release notes (unreachable). Hoist skew: no duplicate rows with pathsAt.
