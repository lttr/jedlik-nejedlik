# Plan — wire agent feedback loops

Goal: turn Vite+ migration speed wins into deterministic hooks. Agent self-heals fast, no context bloat.

## Status — 2026-05-06

| Tier          | Trigger                | Budget    | Tool                   | Status                                |
| ------------- | ---------------------- | --------- | ---------------------- | ------------------------------------- |
| 1 per-edit    | PostToolUse Edit/Write | <500ms    | `vp fmt` on file       | **TODO** — no `.claude/settings.json` |
| 2 end-of-turn | Stop                   | <10s      | `vp lint` + typecheck  | **TODO**                              |
| 3 pre-commit  | git hook               | <30s      | fmt + lint + typecheck | **DONE**                              |
| 4 pre-push    | git hook async         | minutes   | build                  | **TODO** (stub hook present, inert)   |
| 5 CI          | Netlify                | unlimited | already exists         | done                                  |

### What landed

- `vp config` ran → `core.hooksPath = .vite-hooks/_`. Pre-commit fires `vp staged` → `vp check --fix` per `vite.config.ts:staged`, then `vp run typecheck` (~5.2s wall).
- New scripts in root `package.json`: `check`, `check:fix`, `verify` (`vp fmt --check && vp lint && vp run lint:slow && vp run typecheck`).
- Pre-push stub exists in `.vite-hooks/_/pre-push` but no `.vite-hooks/pre-push` payload, so it no-ops.

### Measured budgets (2026-05-06, see `2026-05-02_build-times/notes.md`)

- `vp fmt --check` 1.05s · `vp lint` 0.87s · `vp check` 1.70s · typecheck 5.26s · build 32.2s
- Tier 2 with lint+typecheck = ~6.1s wall, well under <10s budget.
- Tier 3 full (`verify`) = ~7s + `lint:slow` overhead. Likely 10–15s total.

## Remaining steps

- [ ] **Tier 1** — create `.claude/settings.json` with PostToolUse hook matching `Edit|Write`, run `vp fmt {file}`. Silent on success.
  - [ ] Add CLAUDE.md note: pre-commit auto-formats staged files; re-Read after `git commit`.
- [ ] **Tier 2** — Stop hook: `vp lint && vp run typecheck`. Truncate stderr ~50 lines. Cwd = repo root (scripts proxy to `web/` via `vp run -r`).
- [x] **Tier 3 upgrade** — `.vite-hooks/pre-commit` now runs `vp staged` then `vp run typecheck` (~5.2s wall, well under <30s budget).
- [ ] **Tier 4** — populate `.vite-hooks/pre-push` to background `vp run build`, log to `.aiwork/build.log`. Skip if laptop-slow.
- [ ] **Verify** — break a file on purpose, watch each tier fire, confirm agent sees error in transcript.

## Resolved

- ~~Hooks file location~~ → `.claude/settings.json` (checked in, team-wide). Project hooks belong in repo.
- ~~Pre-commit already configured?~~ → Yes, via `vp config` + `vite-plus` staged mechanism. No husky / simple-git-hooks needed.
- ~~Cwd~~ → repo root; root scripts use `vp run -r` to fan out.

## Still unresolved

1. Typecheck (5.26s) in tier 2 Stop hook? Adds latency to every turn. Alternative: tier 2 = lint only, typecheck pushed to tier 3.
2. Lint warnings — currently 0; `--max-warnings 0` redundant. Re-check after rule expansion churn settles.
3. ~~Pre-commit `--fix` mutating files mid-session~~ → not an issue. Agent restarts between commits often enough; CLAUDE.md note ("pre-commit auto-formats staged files — re-Read after `git commit`") covers long-lived sessions. Add the note when wiring tier 1.

## Non-goals

- tsgo swap (Vue not supported)
- LLM judge for scope (article tier, future)
- iteration limits / idle detection (harness handles)
