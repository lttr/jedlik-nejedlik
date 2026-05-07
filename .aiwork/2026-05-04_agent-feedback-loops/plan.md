# Plan — wire agent feedback loops

Goal: turn Vite+ migration speed wins into deterministic hooks. Agent self-heals fast, no context bloat.

## Status — 2026-05-06

| Tier          | Trigger                | Budget    | Tool                           | Status                                         |
| ------------- | ---------------------- | --------- | ------------------------------ | ---------------------------------------------- |
| 1 per-edit    | PostToolUse Edit/Write | <500ms    | `vp fmt` on file               | **DONE** — handled by global `~/.claude` hook  |
| 2 end-of-turn | Stop                   | <10s      | `vp lint` + typecheck          | **TODO**                                       |
| 3 pre-commit  | git hook               | <30s      | fmt + lint + typecheck + smoke | **DONE** (smoke conditional, 2026-05-07)       |
| 4 pre-push    | ~~git hook async~~     | —         | ~~build~~                      | **DROPPED** — build moved into `verify` script |
| 5 CI          | Netlify                | unlimited | already exists                 | done                                           |

### What landed

- `vp config` ran → `core.hooksPath = .vite-hooks/_`. Pre-commit fires `vp staged` → `vp check --fix` per `vite.config.ts:staged`, then `vp run lint:slow` (Nuxt-aware ESLint), then `vp run typecheck`. Cold wall ~9.5s, warm ~3s.
- New scripts in root `package.json`: `check`, `check:fix`, `verify` (`vp check && vp run lint:slow && vp run typecheck && vp run build`). Build included in `verify` instead of a pre-push hook — agent runs verify on demand, no async log + hook-readback complexity.

### Measured budgets (2026-05-06, see `2026-05-02_build-times/notes.md`)

- `vp fmt --check` 1.05s · `vp lint` 0.87s · `vp check` 1.70s · typecheck 5.26s · build 32.2s · `vp run smoke` 6.7s (dev boot + SSR fetch)
- Tier 2 with lint+typecheck = ~6.1s wall, well under <10s budget.
- Tier 3 full (`verify`) = ~7s + `lint:slow` overhead. Likely 10–15s total. With smoke gated on relevant paths, +6.7s only when nuxt config/modules/plugins change.

## Remaining steps

- [x] **Tier 1** — covered by global `~/.claude/settings.json` PostToolUse hook (`format-code.sh`). Walks up tree, finds `vite.config.ts`, runs `vp fmt --write <file>`. No project hook added — Claude Code merges hooks additively (no override), so a project-level duplicate would just double-format. Decided 2026-05-06.
  - [x] CLAUDE.md note added: pre-commit auto-formats staged files; re-Read after `git commit`.
- [ ] **Tier 2** — Stop hook: `vp lint && vp run typecheck`. Truncate stderr ~50 lines. Cwd = repo root (scripts proxy to `web/` via `vp run -r`).
- [x] **Tier 3 upgrade** — `.vite-hooks/pre-commit` now runs `vp staged` → `vp run lint:slow` → `vp run typecheck`. Cold wall ~9.5s (2026-05-07 measurement), well under <30s budget.
- [x] **Tier 3 runtime smoke** — `scripts/smoke-dev.sh` boots `nuxi dev` on port 3199, curls `/`, kills. ~6.7s wall. Wired into pre-commit conditionally (only when staged paths match `web/(nuxt\.config|server/|app/plugins/|package\.json)`) and into `verify:all` deps. Catches SSR runtime errors lint+typecheck miss: broken Nitro plugins, unresolved `#`-imports, bad `runtimeConfig` validation. Motivation: `nuxt-safe-runtime-config@0.1.3` validateAtRuntime plugin externalization broke SSR (2026-05-07 incident); typecheck/lint were green, only a real boot caught it.
- [x] **Tier 4 dropped** — pre-push async build removed (2026-05-06). Async log had no automatic readback path → manual grep would be unreliable. Build instead added to `verify` script: agent runs `vp run verify` when it wants full gate, blocking, see output directly. `.vite-hooks/pre-push` payload deleted, `.gitignore` reverted.
- [ ] **Verify** — break a file on purpose, watch each tier fire, confirm agent sees error in transcript.

## Resolved

- ~~Hooks file location~~ → `.claude/settings.json` (checked in, team-wide). Project hooks belong in repo.
- ~~Pre-commit already configured?~~ → Yes, via `vp config` + `vite-plus` staged mechanism. No husky / simple-git-hooks needed.
- ~~Cwd~~ → repo root; root scripts use `vp run -r` to fan out.

## Still unresolved

1. Typecheck (5.26s) in tier 2 Stop hook? Adds latency to every turn. Alternative: tier 2 = lint only, typecheck pushed to tier 3.
2. Lint warnings — currently 0; `--max-warnings 0` redundant. Re-check after rule expansion churn settles.
3. ~~Pre-commit `--fix` mutating files mid-session~~ → not an issue. Agent restarts between commits often enough; CLAUDE.md note ("pre-commit auto-formats staged files — re-Read after `git commit`") covers long-lived sessions. Add the note when wiring tier 1.
4. Smoke port hardcoded to 3199 (avoids 3000 collision with running dev). If user runs another smoke concurrently → port collision. Acceptable for single-machine dev; revisit if it bites.
5. Smoke kills its `nuxi dev` child via trap; if pre-commit is itself killed mid-run, dev may linger. Mitigation: `fuser -k 3199/tcp` is cheap to add at script start. Not added until proven necessary.

## Non-goals

- tsgo swap (Vue not supported)
- LLM judge for scope (article tier, future)
- iteration limits / idle detection (harness handles)
