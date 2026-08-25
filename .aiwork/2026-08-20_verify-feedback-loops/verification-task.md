# Task: verify the feedback-loop changes

Status: implementation done, final verification interrupted (session closed
mid `vp run verify:all`).

## What was implemented (all of recommendations.md except settings.json)

- §1 `vite.config.ts`: `srcInput` now excludes `**/.aiwork/**`, `**/*.md`,
  and `**/node_modules/.vite-temp/**` (vitest writes a temp config there —
  it self-invalidated `verify:test`).
- §1 smoke test removed after review: redundant — the agent-browser step
  (§6) already verifies the app boots and renders before commit.
- §4 `web/vitest.unit.config.ts` + seed test `web/tests/unit/forms.test.ts`
  (3 tests, pass). New `verify:test` task wired into `verify:all` dependsOn.
- §5 `scripts/directus-probe.sh` (runs probes, stamps `.directus-probe-stamp`
  on success) — `directus:probe` task now calls it. Pre-commit gate
  `scripts/check-probe-stamp.sh` added to `staged` config: blocks commit when
  `directus/config/**` or `web/server/**` staged without a fresher stamp.
  Tested in a scratch repo: no stamp → fail, fresh → pass, stale → fail.
- §6 `implement-spec-to-pr` SKILL.md: Step 5 rewritten to executable
  procedure (verify:all → conditional probe → agent-browser screenshots into
  `.aiwork/{task}/screenshots/` → fill evidence table).
- §7 SKILL.md Step 1: mandatory "Verification evidence" table in specs.
  `scripts/check-evidence-table.sh` fails on empty Value cells in changed
  `.aiwork/**/spec.md`. On-demand only (review decision: no Stop hook, no
  pre-commit gate); the implement-spec-to-pr skill runs it before shipping.
- §2+§3 CLAUDE.md: new "## Verification" section (verify:all only, no piping
  checks, no `git add -A`, kill by port, promote curl proofs, probe gate).
- `.gitignore`: `.aiwork/**/screenshots/`, `.directus-probe-stamp`.
- Fixed pre-existing `vp check` formatting failures in 3 md files
  (2 aiwork tickets + monitor-deploy SKILL.md) surfaced by the first
  full verify run.

## Dropped on review

- `git add -A` deny rules and CLAUDE.md rule — autofixes belong before
  commit time; blanket adds are not the root cause.
- Any hook enforcement (Stop or pre-commit) of the evidence check — it is
  on-demand only, invoked from the implement-spec-to-pr skill.

## Remaining verification

1. `vp run verify:all` — must pass end to end. The interrupted first run was
   slow by design: the srcInput change invalidated every cache key
   ("input configuration changed"), one-time full rebuild.
2. Run `vp run verify:all` a second time immediately: expect ~100% cache
   hits (this is the acceptance for §1 — the untracked
   `.aiwork/**/recommendations.md` must no longer bust the cache).
3. Touch a file under `.aiwork/` (or this file), run verify:all again:
   still all cache hits.
4. Optional: `vp run directus:probe` once to confirm the stamp script works
   against the real instance (needs `DIRECTUS_PROBE_*` in `web/.env`).
5. Commit everything (explicit paths — the new deny rules forbid `-A`).

Known trade-off: md files are excluded from verify cache inputs but
`vp check` still checks them, so a stale-cache pass is possible for
md-only changes; pre-commit `vp check --fix` on staged files covers it.
