# Dependency update 2026-10-12 (2026-W42)

Scan: 15 outdated, 11 in scope (3 majors), 4 report-only (h3, rolldown, vite-plus, vitest pins).

Bumped (one batch, `vp run check:all` green): nuxt 4.6.1 + vue-router 5.4.0 (Nuxt group, together),
@sentry/nuxt 11.6.0, @types/node 26.6.5, eslint-plugin-baseline-js 0.7.4, fallow 3.33.1,
nuxt-auth-utils 0.5.31, vue-tsc 3.3.13.

Nuxt 4.6.0 breaking items checked against web/: no `nuxt/server` imports, no `app*` runtimeConfig keys,
no NuxtTime use. Nuxt 4.6.1 still peers `rolldown: ~1.2.1` (pin 1.2.5 satisfies).

Deferred: @directus/sdk 26 -> 27 (major, data layer, release notes not found; own migration PR),
typescript 7.0.2 (major, native compiler), @nuxt/devtools 4.0.0-beta.4 (prerelease).
Report-only: vite-plus 1.1.0, vitest 5.0.3, rolldown 1.2.13, h3 2.0.2.

DELETE WHEN: vite alias/peerDependencyRules: not satisfied (Nuxt 4.6.1 still no vite-plus compat noted); h3 pin: not satisfied (h3 1.x and 2.x both installed).
Hoist: no pathsAt rows. Root node_modules/vite is still upstream 7.3.2 (known, unchanged); h3 root 1.15.11, ofetch root 1.5.1.
