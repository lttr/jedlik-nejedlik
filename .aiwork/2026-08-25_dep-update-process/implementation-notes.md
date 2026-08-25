# Implementation notes

Built: `.claude/skills/dependency-update/SKILL.md` (all judgement) and
`.claude/skills/dependency-update/scripts/dep-scan.ts` (deterministic scan).

## Deviations from the spec

- **`.claude/**` is excluded from lint; the helper stays plain Node ESM.** The
  repo's oxlint config is type-aware and strict, and a helper script under
  `.claude/` sits outside any tsconfig, so linting it file-by-file (as the Stop
  hook does) resolves its `node:*` imports to `error` and reports phantom
  `no-unsafe-*` violations. Two other fixes were tried and rejected: a typed
  `.ts` helper needs tsconfig coverage to lint cleanly, and both a
  `.claude/tsconfig.json` and a restored root `tsconfig.json` (the latter
  written by a second Claude Code session working this ticket in parallel in
  the same tree) add repo-wide config for the sake of one agent script. The
  rules exist for app code; `.claude/**` joined `ignorePatterns` instead.
- **ADR 0003 corrected.** Its mitigation paragraph said the next run "rebases
  and re-verifies" an open dependency PR; the spec says a run that finds one
  skips the week and touches nothing. The ADR now matches the spec.

## Facts learned while building

- pnpm 11.2.2's `pnpm outdated --format=json -r` is **flat** — one row per
  package with a `dependentPackages: [{name, location}]` array — not the
  `{ workspacePath: { pkg: info } }` shape the prior `npm-dep-update` script
  normalised. Both shapes are handled; the recursive run alone covers the root
  workspace too, so no second non-recursive invocation is needed.
- Many packages declare `repository` as the npm shorthand `"owner/repo"`
  (e.g. `@nuxt/icon` → `nuxt/icon`) rather than a github.com URL. Matching only
  URLs silently lost them.
- `@iconify-json/*` genuinely publish no repository field anywhere; those rows
  come back `repo: null, repoSource: "registry-miss"` and the skill falls back
  to the npm versions page. Patch-level icon data needs no notes anyway.

## Current scan, as a sanity check (2026-08-25)

24 outdated rows: 20 in scope (5 majors — `@directus/sdk` 21→25,
`@nuxtjs/plausible` 3→4, `@dxup/nuxt` 0.2→0.5, `eslint-plugin-baseline-js`
0.6→0.7, `fallow` 2→3), 4 correctly reported out of scope (`@nuxtjs/seo` and
`rolldown` exact pins, `vite-plus` and `vitest` catalog aliases). All three
`DELETE-WHEN` conditions in `pnpm-workspace.yaml` are picked up with their
`ISSUE:` lines.

## Not done

Validation-by-practice from the spec's Testing Decisions: nobody has run
`/dependency-update` end to end yet, so the first real invocation is still the
test. `vp run verify:all` is green on this change itself.
