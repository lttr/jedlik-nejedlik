# Plan — wire agent feedback loops

Goal: turn Vite+ migration speed wins into deterministic hooks. Agent self-heals fast, no context bloat.

## Status — 2026-05-18 — all tiers landed

| Tier          | Trigger                | Budget    | Tool                                                        | Status                                       |
| ------------- | ---------------------- | --------- | ----------------------------------------------------------- | -------------------------------------------- |
| 1 per-edit    | PostToolUse Edit/Write | <500ms    | `vp fmt --write` (global) + `vp lint --fix` (proj)          | **DONE**                                     |
| 2 end-of-turn | Stop                   | <10s      | oxlint + eslint on changed files, fail-fast                 | **DONE**                                     |
| 3 pre-commit  | git hook               | <30s      | staged check + lint:slow + typecheck + smoke + fallow audit | **DONE**                                     |
| 4 pre-push    | ~~git hook async~~     | —         | ~~build~~                                                   | **DROPPED** — build folded into `verify:all` |
| 5 CI          | Netlify                | unlimited | already exists                                              | done                                         |

## What landed

### Tier 1 — per-edit (two layers)

- Global `~/.claude/hooks/format-code.sh` (PostToolUse Edit/MultiEdit/Write) → `vp fmt --write <file>`.
- Project `.claude/hooks/post-edit-fix.sh` (same matcher) → `vp lint --fix <file>`, silent, swallows errors (exit 0). Plan originally said "no project hook" — superseded: format and lint-fix are split across two hooks so neither doubles wall-time nor fights the other.

### Tier 2 — Stop hook

- `.claude/hooks/stop-smart.sh`, wired in `.claude/settings.json` (timeout 30s).
- Lints only changed files (`git diff --name-only HEAD` + untracked). oxlint at workspace root; eslint gets the `web/`-prefix-stripped subset (eslint config lives only in `web/`).
- Fail-fast: exit 2 + stderr tail-50 → agent self-heals in transcript.
- Typecheck deliberately **excluded** here (~5s, vue-tsc can't narrow) — pushed to tier 3. Resolves old unresolved Q1.

### Tier 3 — pre-commit (`.vite-hooks/pre-commit`)

```
vp staged          # vp check --fix on staged files (oxlint + oxfmt)
vp run lint:slow   # Nuxt-aware eslint
vp run typecheck
vp run smoke       # always — no longer path-gated (commit bdc9cc8)
fallow audit --quiet  # dead-code / complexity gate (replaced knip)
```

### Tier 4 — dropped; `verify:all` task graph

- `vite.config.ts` `run.tasks` defines `verify:all` with `dependsOn` fan-out: `verify:check`, `verify:lint`, `verify:typecheck`, `verify:fallow`, `verify:smoke`, `verify:build`. Root `verify` script = `vp run verify:all`.
- Build runs here on demand, not in a hook — blocking, agent sees output directly.

### Also since original plan

- SessionStart hook `worktree-install.sh` — auto-installs deps in fresh worktrees.
- `fallow` replaced `knip` for dead-code/complexity; commits gated on `fallow audit`.

## Remaining

- [ ] **Verify end-to-end** — break a file on purpose, confirm each tier fires and the agent sees the error in transcript. (Only open item.)

## Resolved

- Hooks location → `.claude/settings.json` + `.vite-hooks/` (checked in, team-wide).
- Cwd → repo root; root scripts fan out via `vp run -r`.
- Typecheck in Stop hook → no, tier 3 only.
- Pre-commit `--fix` mutating files mid-session → CLAUDE.md note covers it.
- Smoke now always runs in pre-commit (path-gating dropped) — simpler, ~6.7s acceptable.

## Still unresolved

1. Smoke port hardcoded 3199 — collision risk if two smokes run concurrently. Acceptable single-machine; revisit if it bites.
2. Smoke's `nuxi dev` child may linger if pre-commit is killed mid-run. Mitigation `fuser -k 3199/tcp` at script start — not added until proven necessary.

## Non-goals

- tsgo swap (Vue not supported)
- LLM judge for scope (article tier, future)
- iteration limits / idle detection (harness handles)
