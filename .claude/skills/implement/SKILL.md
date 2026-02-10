---
name: implement
description: Full autonomous feature implementation from customer spec to PR. Use when user provides a customer spec (file path, inline text, or ticket reference) and wants end-to-end implementation including spec/plan artifacts, feature branch, coding, verification, commits, and PR creation.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, WebFetch, Skill
argument-hint: <path-to-spec | inline text>
---

## Context

- Today: !`date +%Y-%m-%d`
- Time: !`date +%H-%M`
- Branch: !`git branch --show-current`
- Status: !`git status --short`

## Step 1 - Spec

Read `$ARGUMENTS` (file path or inline text). Generate a kebab-case slug from it.

Write `spec.md` following work artifacts protocol from memory if available, otherwise put in a sensible location.

Include: original text verbatim in blockquote, summary, decisions table (Decision | Choice | Rationale), scope (in/out), acceptance criteria. For ambiguous points, decide and mark `[DECIDED]`.

## Step 2 - Branch & plan

Create feature branch. Explore codebase for similar patterns and conventions. Use MCP tools for external services if available.

Write `plan.md` next to spec with numbered implementation steps. Mark unclear items `[OPEN]`.

## Step 3 - Implement

Execute plan. Use Task agents for parallel independent work.

## Step 4 - Verify

Loop (max 5x): run project verify/lint/typecheck, fix issues, retry. Then visual check with `browser-tools` skill if available (start dev server, check affected pages, stop server).

## Step 5 - Ship

Commit changes (split if logically separate). Create PR with `gh pr create` (summary, changes, acceptance criteria). Push.

Output report: branch, PR URL, files changed, verification status, open questions.
