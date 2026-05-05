# Plan — wire agent feedback loops

Goal: turn Vite+ migration speed wins into deterministic hooks. Agent self-heals fast, no context bloat.

## Tiers (per article)

| Tier          | Trigger                | Budget    | Tool                          | Status                          |
| ------------- | ---------------------- | --------- | ----------------------------- | ------------------------------- |
| 1 per-edit    | PostToolUse Edit/Write | <500ms    | `vp fmt` on file              | TODO                            |
| 2 end-of-turn | Stop                   | <10s      | `vp lint` + typecheck         | TODO                            |
| 3 pre-commit  | git hook               | <30s      | full lint+typecheck+fmt check | TODO (husky? simple-git-hooks?) |
| 4 pre-push    | git hook async         | minutes   | build                         | optional                        |
| 5 CI          | Netlify                | unlimited | already exists                | done                            |

## Steps

1. **Tier 1** — PostToolUse hook, match `Edit|Write`, run `vp fmt {file}`. Silent on success.
2. **Tier 2** — Stop hook. `vp lint && vp run typecheck`. Truncate errors to ~50 lines. Cwd = `web/`.
3. **Tier 3** — install `simple-git-hooks` (or reuse if present), pre-commit = `vp fmt --check && vp lint && vp run typecheck`.
4. **Tier 4** — pre-push = `vp run build` background, log to `.aiwork/build.log`. Skip if slow on laptop.
5. **Verify** — break a file on purpose, watch hook fire, confirm agent sees error.

## Files to touch

- `.claude/settings.json` — hooks block (project-level, checked in)
- `package.json` — `simple-git-hooks` config or scripts
- maybe `.husky/` if existing

## Non-goals

- tsgo swap (Vue not supported)
- LLM judge for scope (article tier, future)
- iteration limits / idle detection (harness handles)

## Unresolved

1. Hooks in `.claude/settings.json` (checked in, team-wide) or `.claude/settings.local.json` (just me)?
2. Typecheck 4.9s — tier 2 or push to tier 3 only? Tradeoff: agent feedback vs Stop latency.
3. Pre-commit already configured anywhere? Need to check `package.json`.
4. Run hooks from repo root or `web/`? Most scripts live in `web/`.
5. Lint warnings (1 existing) — fail or allow? `--max-warnings 0` strict?
