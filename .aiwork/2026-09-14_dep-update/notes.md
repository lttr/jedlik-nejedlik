# Dependency update — 2026-W38

## Scan

12 outdated direct deps found after a clean `vp install` (the pre-existing
`node_modules` was missing `@nuxt/scripts` entirely and had `fallow` a minor
behind its own declared range — reinstalling fixed both before the scan ran,
so neither appears as a "bump" below). 8 in scope, 2 majors, 4 out of scope
(exact pins / catalog alias).

## Bumped (batch)

- `@iconify-json/logos` 1.2.13 → 1.2.14 (patch, icon data)
- `@nuxtjs/seo` 5.3.14 → 5.3.16 (patch — bundling + i18n route-resolution
  fixes, no breaking changes)
- `@sentry/nuxt` 10.73.0 → 10.74.0 (minor — single Nuxt-relevant fix is
  Windows-only path handling, irrelevant to our Linux deploy)
- `@types/node` 26.4.1 → 26.5.1 (minor, type declarations only)
- `fallow` 3.22.0 → 3.25.0 (minor — breaking changes are Windows path
  rendering and stricter `fix` refusal on incomplete analysis; neither
  affects this repo)
- `zod` 4.5.4 → 4.6.3 (minor — breaking changes are lazy error-map timing,
  stricter `z.emoji()`, and a `z.properties()` standalone-schema removal;
  grepped `web/` for `z.emoji`, `z.properties`, `.validate(` — no hits)

## Deferred majors (queued, not in this batch)

- `@nuxt/devtools` 3.4.2 → 4.0.0-alpha.18 — npm's `latest` tag points at an
  alpha; no stable v4 exists yet. Waiting for a stable release.
- `typescript` 5.9.3 → 7.0.2 — this is the native/Go compiler rewrite
  (`microsoft/typescript-go`), a two-major jump (5.9 → 6.0 → 7.0). Needs a
  dedicated migration run once `vue-tsc`/ESLint tooling compatibility is
  confirmed; far too large for the weekly batch.

## Reported, not touched

- `h3` 1.15.11 (exact pin) — latest 2.0.1-rc.31, prerelease only
- `rolldown` 1.2.5 (exact pin) — latest 1.2.8, moves only in lock-step with
  a `vite-plus` bump
- `vite-plus` 0.3.0 (catalog) — latest 0.3.1, same lock-step rule
- `vitest` 4.1.11 (exact pin) — latest 5.0.0, same lock-step rule

## Hoist skew

- `h3`: root hoists 2.0.1-rc.29 (major 2, dragged in by
  `@eslint/config-inspector`), Nuxt's tsconfig `paths` correctly point at
  the pinned `h3@1.15.11` (major 1) — the existing workaround is working.
- `ofetch`: two majors in the lockfile, but only because `@nuxt/telemetry`
  privately depends on `ofetch@2.0.0-alpha.3` for its own use. Root hoist
  and Nuxt's tsconfig `paths` both currently agree on `ofetch@1.5.1`. Not
  biting; no pin needed yet.

## DELETE-WHEN status

- `vite` override / `peerDependencyRules` ("Nuxt ships vite-plus compat"):
  **not satisfied** — `nuxt` latest is still 4.5.2, unchanged.
- `h3` pin ("no second h3 major installed, or nitro moves to h3 v2"):
  **not satisfied** — two majors still present per hoist-skew scan above.

## Outcome

✅ `vp run check:all` green after the batch bumps. Commit 2 absent — no code
changes were needed. PR opened for the batch.
