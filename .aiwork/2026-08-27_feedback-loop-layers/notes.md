---
status: done
references:
  - "claude-marketplace: plugins/aiwork/skills/implement-spec/SKILL.md"
  - "Prior work: ../2026-08-20_verify-feedback-loops/recommendations.md"
  - https://code.claude.com/docs/en/code-review.md
  - https://code.claude.com/docs/en/skills.md#run-and-verify-your-app
---

# Feedback loop vs. final verifier: conclusions and current state

Session reviewed the `implement-spec` skill against Anthropic's recommendation:
the feedback loop runs continuously with the work, while the verifier is a
one-shot check in a fresh context after the work looks done. Verdict: the skill
conforms. The per-ticket loop (`/tdd`, `/simplify`, `/verify`, acceptance
criteria) is the feedback loop; the wrap-up `/code-review xhigh --fix` is the
fresh-context verifier.

## Facts verified against the docs

- `/code-review` runs as a background subagent with its own context window.
  With `--fix`, the subagent itself applies edits to the working tree (outside
  checkpoints, so `/rewind` cannot undo them). Findings still return to the
  calling session, which can fix anything left unapplied.
- The built-in `/verify` only builds and runs the app to confirm behavior. It
  deliberately does not run tests, lint, or typecheck. Static analysis in the
  ticket loop must come from somewhere else.

## Where each check belongs

A check goes at the most frequent boundary where it is still cheap, and never
later than the last point where a failure is easy to attribute. A check failing
at boundary N should have been impossible at boundary N-1.

1. Per edit (PostToolUse hook): format and fast lint with `--fix`, silent.
2. Per ticket, in the loop: the ticket's tests and behavioral `/verify`, the
   checks that need agent judgment, so they live in skill prose.
3. Per commit (pre-commit hook): whole-project static analysis (typecheck,
   eslint, audit). The deterministic gate; `--no-verify` is denied.
4. Wrap-up (skill prose): full suite and build on the merged branch. Per-ticket
   checks saw only a single ticket's branch state and merges ran nothing, so
   this is the first check of the combination.
5. Deploy (Coolify): production build as a safety net, never the first detector.

## Decisions

- **Remove the Stop-hook lint pass** (`stop-smart.sh`) — APPLIED. By the time
  an agent stops, the pre-commit gate has enforced lint on anything committed,
  and `CLAUDE.md` designates that gate as the fix loop. The Stop hook itself
  was kept, pointed at `verify-log-bash.sh sweep` only: the sweep is what logs
  failed Bash commands, and `docs/verify-log.md` depends on it.
  `.claude/settings.json` now wires only `post-edit-fix.sh`,
  `session-bootstrap.sh` and `verify-log-bash.sh`.
- **Rejected as too slow for their value:** a `SubagentStop` lint hook
  (redundant, subagents stop after their commit), a `pre-push` gate running
  `verify:all`, and post-merge static checks in the orchestrator. Latency was
  chosen over earlier detection; wrap-up and Coolify catch the remainder later.
- **Skill edits committed to claude-marketplace:** wrap-up now states the review
  runs in a fresh subagent (never review the diff by hand) and that the
  verification gate covers what the ticket loop cannot: the merged branch and
  any check no earlier boundary ran. Wording kept repo-agnostic on purpose; the
  hook safety net is repo configuration, not part of the portable skill.

## Open

- `implement-spec` ticket loop still has no static analysis of its own; it
  relies on each project's pre-commit gate. In a project without one, lint and
  typecheck wait until wrap-up. Accepted for now.

## Retired 2026-09-02

The verification log (`scripts/verify-log*.sh`, `verify-log-bash.sh`,
`docs/verify-log.md`, the Bash Pre/PostToolUse and Stop hooks) was removed.
It lived in `/tmp`, so the sessions it was built to audit — the August auth
implementation — were gone by the time anyone read it; the six days that
survived showed only a documentation branch. `post-edit-fix.sh` keeps the
silent lint, minus the record.

To rebuild: the implementation lives in cb7d0e7..ba32eed (logger, report
script, hooks, wiring) and its design record is
`git show 3eff6ef:docs/verify-log.md` (record shape, sweep semantics, the
PostToolUse-skips-on-failure finding, caveats).
