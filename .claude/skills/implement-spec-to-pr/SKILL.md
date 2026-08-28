---
name: implement-spec-to-pr
description: Full autonomous feature implementation from customer spec to PR. Use when user provides a customer spec (file path, inline text, or ticket reference) and wants end-to-end implementation including spec/plan artifacts, feature branch, coding, verification, commits, and PR creation.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, WebFetch, Skill
argument-hint: <path-to-spec | inline text>
---

## Context

- Today: !`date +%Y-%m-%d`
- Time: !`date +%H-%M`
- Branch: !`git branch --show-current`
- Status: !`git status --short`

## Step 0 - Verification log

Every verification command is logged automatically (Bash-tool hook, post-edit
hook, Stop hook) to a scratch log outside the repo
(`scripts/verify-log.sh path` prints it). Your job is only the
milestones that no hook can see - one line each, at the moment they happen:

```bash
scripts/verify-log.sh event --event task-start   --message "Task 3: hero image"
scripts/verify-log.sh event --event task-done    --message "Task 3"
scripts/verify-log.sh event --event review-start --message "my-code-review"
scripts/verify-log.sh event --event review-fixed --message "2 findings"
```

Never gate work on the logger - it is fire-and-forget bookkeeping.

## Step 1 - Spec

Read `$ARGUMENTS` (file path or inline text). Generate a kebab-case slug from it.

Create `.aiwork/{date}_{slug}/spec.md` per the .aiwork protocol.

First, copy the FULL original text into a blockquote. This is a mechanical paste - never summarize, truncate, or rephrase.

Then write analysis sections: summary, decisions table (Decision | Choice | Rationale), scope (in/out), acceptance criteria. Mark ambiguous points `[DECIDED]`.

End the spec with a mandatory "Verification evidence" table and fill each Value cell as the evidence lands during the work. Check it before shipping with `scripts/check-evidence-table.sh` (on-demand, not enforced by any hook); "n/a" answers stay visible for human review in the PR:

```markdown
## Verification evidence

| Evidence    | Value                                     |
| ----------- | ----------------------------------------- |
| Tests       | path, or "n/a: why"                       |
| Probe run   | timestamp, or "n/a: no permission change" |
| Screenshots | paths, or "n/a: no UI change"             |
```

## Step 2 - Branch & plan

Create feature branch. Explore codebase for similar patterns and conventions. Use MCP tools for external services if available.

For complex tasks, write `plan.md` next to spec with numbered implementation steps. Mark unclear items `[OPEN]`.

## Step 3 - Implement

Execute plan. Use Task agents for parallel independent work.

## Step 4 - Improve

Improve all rendered text with `/czech-typography` skill.

## Step 5 - Verify

1. Run `vp run check:all` — the only static-correctness gate (lint, typecheck, unit tests, build; caching makes repeats free). Never run the sub-tasks standalone.
2. If the branch touches `directus/config/**` or `web/server/**`, run `vp run directus:probe` — the pre-commit gate blocks the commit without a fresh probe stamp.
3. Browser check, executable procedure: use the `run-jedlik-nejedlik` skill with `agent-browser`, screenshot every changed route into `.aiwork/{task}/screenshots/` (gitignored — working evidence, not repository content), and list the screenshot paths in implementation-notes and the final report.
4. Fill the "Verification evidence" table in the spec (tests path, probe timestamp, screenshot paths — or explicit "n/a: why"), then run `scripts/check-evidence-table.sh` to confirm no cell is empty.

## Step 6 - Ship

Commit changes (split if logically separate).

Lint and format are enforced by the pre-commit hook — don't run a linter by name beforehand. If the hook fails, fix what it reports and re-commit. `--no-verify` is not an option.

Ask whether to create a PR.
If yes: Create PR with `gh pr create` (summary, changes, acceptance criteria). Push.

Output report: branch, PR URL, files changed, verification status, open questions.

Close with the verification log, so the run is auditable after the fact:

```bash
scripts/verify-log-report.sh summary
scripts/verify-log-report.sh redundant
```

Include the summary in the report and call out anything the `redundant` view
flags (same command re-run against an unchanged tree).
