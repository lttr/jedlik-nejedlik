# Review — layers scaffolding (area 00)

Date: 2026-07-21. Range reviewed: `b8d0690..c011cfc` (5 commits, 20 files).

## Checks

- `vp run build` ✓, `vp run typecheck` ✓, eslint ✓ (after fixes below).
- fallow: layer files were flagged unreachable (fallow has no Nuxt-layer
  awareness) — fixed by declaring `web/layers/*/{nuxt.config.ts,app,shared,server}`
  entry globs in `.fallowrc.jsonc`. Remaining findings (1 unused file,
  `@nuxtjs/plausible` dep, dupes) are pre-existing baseline, verified by
  running fallow on `b8d0690` in a throwaway worktree.
- eslint: 3 new `@typescript-eslint/triple-slash-reference` errors in the
  domain layers' `nuxt.config.ts` — fixed with per-line disables (a .d.ts
  path is not importable, so the reference is the only mechanism).
- Fixes committed as `c011cfc`.

## Multi-agent review (5 parallel reviewers)

CLAUDE.md compliance, bug detection (behavioral diff of moved Directus code
against deleted originals), git-history context (no recent intentional
change lost in the move — c7288c5/dc11c8a/d24b918 work all preserved),
security & error handling, comments & spec intent — **all returned no
issues**. Nothing reached the confidence-scoring step.

Notable verified-intentional change: `BiographyExpertCollection` went from
zod-derived to a hand-written interface (layer must not import app
code/zod); drift is guarded by the explicit return annotation on
`biographyExpertRequest`.

## Outcome

No findings above threshold; no findings left unfixed. Deploy verification
recorded in implementation-notes.md.
