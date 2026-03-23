---
created: 2026-03-23
type: plan
status: active
---

# Fix /implement skill - root cause analysis

## What went wrong

Four defects from running `/implement` on this task. All trace back to structural issues in the skill, not just wording.

## Root cause analysis

### 1. Spec not following .aiwork protocol

**Symptom:** Spec has ad-hoc structure, not matching `.aiwork` artifact conventions.
**Root cause in skill:** Line 19 says "following work artifacts protocol from memory if available, otherwise put in a sensible location". The protocol is always in context (CLAUDE.md references `@aiwork-protocol.md`), so "if available" creates false uncertainty, and "otherwise put in a sensible location" gives an escape hatch that undermines the requirement.
**Fix:** Just say "per .aiwork protocol" - no conditionals, no fallback.

### 2. No plan.md created

**Symptom:** Went straight from spec to implementation, no plan artifact.
**Root cause in skill:** Step 2 says "Enter `/plan` mode" -> "Write `plan.md`" -> "Exit `/plan` mode". Plan mode is an _interactive_ mechanism - it pauses execution, requires user approval, and fundamentally conflicts with the _autonomous_ nature of `/implement`. When I hit this friction, I subconsciously skipped the entire step to maintain flow. No plan mode = no plan.md.
**Fix:** Remove `/plan` mode from the skill entirely. Just write `plan.md` directly as a file. Exploration and planning don't need the interactive plan mode mechanism.

### 3. Spec missing full original text

**Symptom:** Spec blockquote contained ~40 lines instead of all 112 lines from source.
**Root cause in skill:** Line 21 says "original text verbatim in blockquote" as one bullet among many in a single "Include:" list. The full text and the analysis sections (summary, decisions, scope) are conflated into one instruction, making it easy to treat the original text as just another section to write concisely.
**Fix:** Separate the two concerns structurally. First: paste full original text (mechanical copy). Then: write analysis sections (creative work). Two distinct sub-steps, not one list.

### 4. Wrong quote characters

**Symptom:** Used Unicode `„"` from source file instead of `&bdquo;&ldquo;` entities matching sibling pages.
**Root cause in skill:** Step 4 (Improve) says "Improve all rendered text with `/czech-typography` skill." This loads abstract typography rules but doesn't say to check what conventions the existing codebase already uses. Typography correctness requires both knowing the rules AND matching the project's existing patterns.
**Fix:** Add explicit instruction to grep existing files for conventions (entity style, quote chars, spacing patterns) before applying typography. Codebase consistency first, then rules.

### 5. Step numbering bug

Two steps are numbered "Step 4" (Improve and Verify). Minor but indicates the skill wasn't reviewed carefully.

## Changes to `/.claude/skills/implement/SKILL.md`

### Step 1 - Spec

```
Read `$ARGUMENTS` (file path or inline text). Generate a kebab-case slug from it.

Create `.aiwork/{date}_{slug}/spec.md` per the .aiwork protocol (@aiwork-protocol.md).

First, copy the FULL original text into a blockquote. This is a mechanical paste - never summarize, truncate, or rephrase.

Then write analysis sections: summary, decisions table (Decision | Choice | Rationale), scope (in/out), acceptance criteria. Mark ambiguous points `[DECIDED]`.
```

### Step 2 - Branch & plan

```
Create feature branch. Explore codebase for similar patterns and conventions. Use MCP tools for external services if available.

For complex tasks, write `plan.md` next to spec with numbered implementation steps. Mark unclear items `[OPEN]`.
```

(Removed: Enter/exit `/plan` mode - it's interactive and conflicts with autonomous flow)

### Step 4 - Improve

Keep as-is: "Improve all rendered text with `/czech-typography` skill." No changes needed - the implement skill should delegate to czech-typography without duplicating its concerns. The codebase-consistency issue (quote chars) should be addressed in the czech-typography skill itself separately.

### Step numbering

Fix: 1-Spec, 2-Branch & plan, 3-Implement, 4-Improve, 5-Verify, 6-Ship

## Files to modify

- `.claude/skills/implement/SKILL.md` - all changes above

## Then fix this task's outputs

After fixing the skill, also fix the current implementation:

- `.aiwork/2026-03-23_rodice-u-skolek/spec.md` - rewrite with full text + proper structure
- `web/app/pages/pro-odborniky/skoly.vue` - replace 5 Unicode quote pairs with `&bdquo;`/`&ldquo;` entities

## Verification

1. Read the updated skill and verify each root cause is addressed
2. `nr verify` passes after fixing skoly.vue quotes
3. `grep -P '[\x{201E}\x{201C}]' web/app/pages/pro-odborniky/skoly.vue` returns nothing (no leftover Unicode quotes)
