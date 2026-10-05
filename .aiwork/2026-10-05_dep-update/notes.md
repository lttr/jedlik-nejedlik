# Dependency update 2026-10-05 (2026-W41)

Scan: 14 outdated, 10 in scope, 4 report-only (h3, rolldown, vite-plus, vitest pins).

Bumped (patch/minor, one batch): @iconify-json/logos 1.2.15, @nuxt/scripts 1.3.12,
@sentry/nuxt 11.4.0, @types/node 26.6.4, eslint 10.12.0, eslint-plugin-baseline-js 0.7.3,
fallow 3.31.0, vue-tsc 3.3.12. `vp run check:all` green.

Deferred: typescript 5.9.3 -> 7.0.2 (major, native compiler; needs its own migration PR with
vue-tsc/Nuxt compatibility check), @nuxt/devtools 4.0.0-beta.3 (prerelease).
Report-only: vite-plus 1.0.0, vitest 5.0.3, rolldown 1.2.12 (the four-row set moves together; not touched), h3 2.0.1 (pin follows nitro).
