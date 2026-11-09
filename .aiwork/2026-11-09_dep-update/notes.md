# Dependency update 2026-W46

Scan: 21 outdated (18 in scope, 5 major, 3 out of scope).

Bumped (non-Nuxt-group patches/minors): @dxup/nuxt 0.5.10→0.5.11, @iconify-json/logos 1.2.17→1.2.19, @sentry/nuxt 11.9.0→11.11.0, @types/node 26.6.5→26.6.6, eslint 10.13.0→10.14.0, eslint-plugin-baseline-js 0.7.5→0.7.7, nuxt-svgo 5.3.0→5.3.2, vue-tsc 3.3.13→3.3.14, fallow 3.35.0→3.41.0.

Deferred:

- Nuxt group (indivisible): nuxt 4.6.4, vue 3.5.45, @nuxt/icon 2.6.2, @nuxt/image 2.2.1, plus majors @nuxt/devtools 4, @nuxt/fonts 1, @nuxtjs/seo 6. Majors not yet reviewed; needs its own run.
- @directus/sdk 26→27: no usable release notes found, 18 files use it.
- typescript 5.9→7.0: major, likely needs code/tooling changes.

Reported, not touched: vite-plus 1.1.0→1.5.0 and rolldown 1.2.12→1.3.0 (three-row pinned set, exact pins).

DELETE-WHEN: vite override and peerDependencyRules need "Nuxt ships vite-plus compat" — not evaluated against new notes; not satisfied (no Nuxt release read).

Hoist skew: h3 1.x/2.x, tsconfig paths → 1.15.11, matches hoisted root. Nothing tripped.

Outcome: `vp run check:all` green.
