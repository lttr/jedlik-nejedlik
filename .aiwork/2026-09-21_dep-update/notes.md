# Dependency update — 2026-W39

## Scan

`dep-scan.mjs`: 14 outdated rows, 10 in scope, 4 out of scope (exact pins /
catalog alias), 4 majors among the in-scope rows.

## Bumped (batch)

- `@sentry/nuxt` 10.74.0 → 10.75.0 (minor) — Nitro-version-detection fix only,
  no breaking changes.
- `@types/node` 26.5.1 → 26.6.2 (minor) — type-only.
- `eslint` 10.10.0 → 10.11.0 (minor) — rule refinements, no new defaults.
- `fallow` 3.25.0 → 3.27.0 (minor) — the two behaviour shifts in 3.26.0
  (`fail-on-issues: false` gates now fail the build; `build/` exclusion now
  matches at any depth) don't touch us: `.fallowrc.jsonc` sets no
  `fail-on-issues`, and there is no nested `build/` directory in the repo.
- `vue` 3.5.42 → 3.5.43 (patch).
- `zod` 4.6.3 → 4.6.5 (patch).
- `@vueuse/core` + `@vueuse/nuxt` 14.4.0 → 15.0.0 (major, moved together) —
  breaking items checked against the codebase: `templateRef` removal, the
  timer `scheduler` option change, `useEventSource` behaviour, `useIDBKeyval`
  cross-tab sync, `useThrottleFn` default `trailing` flip. `rg` for each name
  across `web/app` and `web/server` found zero usages; the only VueUse
  composables actually imported are `useStorage` and `useElementSize`
  (unaffected). Node 20 EOL doesn't apply — repo runs Node 22.

`pnpm dedupe` ran after the bumps (removed 210 duplicate packages).

## Deferred

- `@nuxt/devtools` 3.4.2 → 4.0.0-beta.1 — npm's `latest` dist-tag points at a
  prerelease (confirmed via the registry). Not bumping to a beta; revisit once
  a stable 4.0.0 ships.
- `typescript` 5.9.3 → 7.0.2 (major, own PR slot not used) — this skips a
  whole major: 6.0 shipped between them. 7.0 is the Go-native port with no
  programmatic API; the official announcement states Vue/Svelte/Angular
  tooling "cannot yet use TypeScript 7" and must stay on 6.0. Neither 6.0 nor
  7.0 is realistic while `vue-tsc`/Nuxt depend on the JS API, so this is left
  alone rather than attempted as a migration PR this run.

## Reported, not touched (out of scope)

- `h3` 1.15.11 → 2.0.1-rc.32 — exact pin, tracks `nitropack`'s resolved copy.
- `rolldown` 1.2.5 → 1.2.9 — exact pin, moves only with the `vite-plus` group.
- `vite-plus` 0.3.0 → 0.3.3 (`catalog:`) — same four-row group as `rolldown`.
- `vitest` 4.1.11 → 5.0.1 — exact pin, moves only with the `vite-plus` group.

## Hoist skew

`hoistSkew.skewed` still lists `h3` (majors 1/2, root hoists 1.15.11 — correct,
matches the documented pin) and `ofetch` (majors 1/2, root hoists 1.5.1). Ofetch
has no `pnpm-workspace.yaml` pin yet; nothing in this run's bumps touches the
nitro/h3/ofetch chain, so left as report-only per the skill.

## DELETE-WHEN status

- `overrides.vite` / `peerDependencyRules` ("Nuxt ships vite-plus compat") —
  not satisfied; no such compat shipped in this scan's release notes.
- `web/package.json` `h3` exact pin ("no second h3 major installed, or Nitro
  3 / h3 v2 lands") — not satisfied; hoistSkew still shows both majors 1 and 2
  installed.

## Outcome

✅ Batch bump only, no migration PR this run. `vp run check:all` run before
opening the PR (see PR body for the result).
