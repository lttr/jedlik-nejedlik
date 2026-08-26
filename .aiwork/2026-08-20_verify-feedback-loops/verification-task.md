# Task: verify the feedback-loop changes

Status: done. Implementation shipped (commits `5689d14`, `0157497`) and the
remaining verification ran clean on 2026-08-26.

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

## Remaining verification — done 2026-08-26

1. [x] `vp run verify:all` — passes end to end.
2. [x] Immediate second run: 6/8 cache hit (75%). The two misses are
   `verify:fallow` (modifies its own input — its report file) and
   `verify:all` itself (cache disabled by design). Every real check
   (check/lint/typecheck/test/build) is a hit. §1 accepted.
3. [x] Touched `.aiwork/**/recommendations.md`, re-ran: identical 6/8 —
   `.aiwork/` no longer busts the cache.
4. [ ] Optional `vp run directus:probe` against the real instance — not run;
   no `.directus-probe-stamp` on disk yet. The stamp/gate logic was proven in
   a scratch repo, so this only leaves the live-instance path unexercised.
   It will be exercised by the next commit touching `directus/config/**` or
   `web/server/**`.
5. [x] Everything committed with explicit paths.

Known trade-off: md files are excluded from verify cache inputs but
`vp check` still checks them, so a stale-cache pass is possible for
md-only changes; pre-commit `vp check --fix` on staged files covers it.
