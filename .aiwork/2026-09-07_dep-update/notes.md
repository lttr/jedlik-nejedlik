# Dependency update — 2026-W37

## Scan

`dep-scan.mjs`: 11 outdated direct deps, 8 in scope, 3 out of scope (`h3`,
`rolldown`, `vitest` — all exact pins), 3 majors.

## Bumped (batch PR `claude/deps-2026-W37`)

| package        | from    | to      | bump  |
| -------------- | ------- | ------- | ----- |
| `@eslint/css`  | 1.4.0   | 2.0.0   | major |
| `@sentry/nuxt` | 10.72.0 | 10.73.0 | minor |
| `eslint`       | 10.9.1  | 10.10.0 | minor |
| `fallow`       | 3.20.0  | 3.22.0  | minor |
| `@types/node`  | 26.4.0  | 26.4.1  | patch |
| `vue-router`   | 5.3.0   | 5.3.1   | patch |

## Majors in this batch

- **`@eslint/css` 1.4.0 → 2.0.0** — the only breaking change in the 2.0.0
  changelog is `meta.languages` becoming a required field on CSS rule
  objects. That only affects code that _defines_ rules for this plugin.
  Searched `web/eslint.config.js` (the only file importing `@eslint/css`):
  we only consume the plugin's built-in `css/css` language and
  `css/use-baseline` rule via config, we don't author custom rule objects.
  No hit → doesn't touch this codebase.

## Code changes

None — commit 2 absent. `vp run check:all` passed on the first try for the
whole batch.

## Deferred

- **`@nuxt/devtools` 3.4.2 → 4.0.0-alpha.17 — not adoptable.** Confirmed via
  the npm registry that `4.0.0-alpha.17` is genuinely the `latest` dist-tag
  (not a scan artifact), i.e. no stable 4.x exists yet. Never batch a
  pre-release; revisit once a non-alpha 4.0.0 ships.
- **`typescript` 5.9.3 → 7.0.2 — still blocked, still not queued.** Same
  finding as 2026-W36: TS 7.0 (the native Go port) ships with no stable
  programmatic API yet, so Vue/vue-tsc, MDX, Astro, Svelte and Angular
  tooling can't consume it — confirmed again this week straight from the
  "Announcing TypeScript 7.0" post, which explicitly names Vue as blocked
  and recommends staying on 6.0. TS 6.0 itself is a real migration on its
  own (defaults change: `strict`, `module`, `target`, `types`, `rootDir`,
  plus several removed options) — not something to fold into a safe batch.
  No action; revisit once `vue-tsc`/`@vue/language-tools` declare 7.x
  support.

## Reported, not touched

- `h3` — exact pin `1.15.11`. See DELETE-WHEN below; still needed.
- `rolldown` — exact pin `1.2.5`, newer `1.2.7` available. Tracks
  `vite-plus`'s bundled copy (currently 0.3.0), moves only in lock-step with
  a `vite-plus` bump.
- `vitest` — exact pin `4.1.11`, newer `5.0.0` available (major). Tracks
  `vite-plus`'s bundled copy the same way as `rolldown`; not touched on its
  own.

## Hoist skew

- `h3` — installed at majors 1 (`1.15.11`, direct pin in `web/package.json`)
  and 2 (`2.0.1-rc.29`, transitive). Nuxt's generated tsconfig `paths`
  currently point at the pinned `1.15.11` copy, which matches what
  `@nuxt/nitro-server`/`nitropack` actually resolve for `defineEventHandler`
  — paths agree with the framework's own range, no latent break.
- `ofetch` — installed at majors 1 (`1.5.1`, hoisted to root) and 2
  (`2.0.0-alpha.3`, transitive via `@nuxt/cli`). Nuxt's tsconfig `paths`
  point at `1.5.1`, which is what the framework actually uses at runtime —
  agrees with the framework's range, no action needed. Flagged in the skill
  as "the next candidate" for a pin; still only correct by luck of the
  hoist, not by a declared range in `web/package.json`.

## DELETE-WHEN status

- **`h3` pin** (`pnpm-workspace.yaml` comment): DELETE WHEN "no second h3
  major is installed, or Nuxt moves to nitro 3 / h3 v2". `pnpm why h3` still
  shows both `1.15.11` and `2.0.1-rc.29` installed — **not satisfied**.
- **`vite` override + `peerDependencyRules`**: DELETE WHEN "Nuxt ships
  vite-plus compat". Checked `@nuxt/vite-builder@4.5.2`'s own
  `package.json`: it still declares `vite: ^8.2.0` as a direct dependency
  (not a peer) — **not satisfied**, unchanged from last week.

## Outcome

✅ Green. `vp run check:all` passes on the full batch, first try, no drops.
PR: batch update for 2026-W37.
