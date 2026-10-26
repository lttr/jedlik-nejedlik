# Dep update 2026-W44

Scan: 15 outdated (12 in scope, 3 report-only, 5 majors).

Bumped: @iconify-json/logos 1.2.17, @sentry/nuxt 11.9.0, fallow 3.35.0. `vp run check:all` green.

Deferred:

- Nuxt group (nuxt 4.6.2, vue 3.5.44, @nuxt/icon 2.6.1, @nuxt/image 2.2.0, @nuxt/fonts 1.1.0, @nuxtjs/seo 6.0.1, @nuxt/devtools 4.0.0-beta.7): indivisible, and it contains majors whose release notes were not reviewed this run, so the whole group waits. devtools is a beta, never take it.
- @directus/sdk 26 → 27: major, not reviewed.
- typescript 5.9.3 → 7.0.2: native compiler rewrite, needs its own migration PR.

Report only: rolldown 1.2.12 (pin; 1.2.15 available), vite-plus 1.1.0 (catalog; 1.4.0 available). Move together with the vite/vite-plus catalog rows.

DELETE-WHEN: both pnpm-workspace.yaml conditions ("Nuxt ships vite-plus compat") not satisfied; not evaluated against release notes. Hoist skew: no duplicate rows with pathsAt.
