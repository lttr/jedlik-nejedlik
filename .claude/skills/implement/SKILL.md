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

Create `.aiwork/{date}_{slug}/spec.md` per the .aiwork protocol.

First, copy the FULL original text into a blockquote. This is a mechanical paste - never summarize, truncate, or rephrase.

Then write analysis sections: summary, decisions table (Decision | Choice | Rationale), scope (in/out), acceptance criteria. Mark ambiguous points `[DECIDED]`.

## Step 2 - Branch & plan

Create feature branch. Explore codebase for similar patterns and conventions. Use MCP tools for external services if available.

For complex tasks, write `plan.md` next to spec with numbered implementation steps. Mark unclear items `[OPEN]`.

## Step 3 - Implement

Execute plan. Use Task agents for parallel independent work.

## Step 4 - Improve

Improve all rendered text with `/czech-typography` skill.

## Step 5 - Verify

Loop (max 5x): run `/verify`, fix issues, retry. Then visual check with `browser-tools` skill if available (start dev server, check affected pages, stop server).

## Step 6 - Ship

Commit changes (split if logically separate).

Ask whether to create a PR.
If yes: Create PR with `gh pr create` (summary, changes, acceptance criteria). Push.

Output report: branch, PR URL, files changed, verification status, open questions.
