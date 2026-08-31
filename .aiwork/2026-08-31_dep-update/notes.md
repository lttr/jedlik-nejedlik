# Dependency update — 2026-W36

## Scan

`dep-scan.mjs`: 15 outdated direct deps, 14 in scope, 1 out of scope (`rolldown`,
exact pin), 5 majors.

## Bumped (batch PR `claude/deps-2026-W36`)

| package                     | from    | to      | bump        |
| --------------------------- | ------- | ------- | ----------- |
| `@directus/sdk`             | 21.3.0  | 25.0.1  | major       |
| `@types/node`               | 24.13.3 | 26.4.0  | major       |
| `eslint-plugin-baseline-js` | 0.6.2   | 0.7.1   | major (0.x) |
| `fallow`                    | 2.75.0  | 3.20.0  | major       |
| `@eslint/css`               | 1.2.0   | 1.4.0   | minor       |
| `@sentry/nuxt`              | 10.51.0 | 10.72.0 | minor       |
| `eslint`                    | 10.2.1  | 10.9.1  | minor       |
| `vue-router`                | 5.2.0   | 5.3.0   | minor       |
| `vue-tsc`                   | 3.2.7   | 3.3.11  | minor       |
| `zod`                       | 4.4.3   | 4.5.4   | minor       |
| `vue`                       | 3.5.41  | 3.5.42  | patch       |
| `@iconify-json/bi`          | 1.2.6   | 1.2.7   | patch       |
| `@iconify-json/logos`       | 1.2.10  | 1.2.13  | patch       |

## Code changes

`@sentry/nuxt` 10.72.0 deprecated `sendDefaultPii` (removed in v11) in favour of
the granular `dataCollection` option. `vp check`'s `typescript(no-deprecated)`
rule caught it. Replaced `sendDefaultPii: true` in `web/sentry.client.config.ts`
and `web/sentry.server.config.ts` with the exact equivalent `dataCollection`
object (matched against `@sentry/core`'s `defaultPiiToCollectionOptions`
bridge, so behaviour is unchanged).

## Deferred

- **`typescript` 5.9.3 → 7.0.2 — blocked, not queued for a normal migration.**
  TS 7.0 is the native (Go) compiler port. Per the TS team's own release notes
  it does not yet expose a stable programmatic API, so Vue/vue-tsc, MDX,
  Astro, Svelte and Angular tooling cannot consume it yet — the TS team
  itself recommends staying on 6.0 for such projects. We're two majors behind
  (5.9 → 6.0 → 7.0); revisit once `vue-tsc`/`@vue/language-tools` declare 7.x
  support.

## Reported, not touched

- `rolldown` — exact pin `1.2.5`, newer `1.2.6` available. Tracks `vite-plus`'s
  bundled copy (currently 0.3.0), moves only in lock-step with a `vite-plus`
  bump per CLAUDE.md.

## DELETE-WHEN status

Both documented workarounds trigger on the same condition ("Nuxt ships
vite-plus compat"): `nuxt`/`@nuxt/vite-builder` pulling their own upstream
`vite` instead of accepting the `vite-plus` override, and `vite-plus-core`'s
version string satisfying no upstream `vite` range. `nuxt` itself is already
at latest (not in this week's outdated list) and untouched by this run —
**not satisfied**, unchanged from last week.

## Outcome

✅ Green. `vp run check:all` passes on the full batch (incl. the `@sentry/nuxt`
deprecation fix). PR: batch update for 2026-W36.
