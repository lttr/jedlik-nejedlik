---
status: not-started
references:
  - "Prior work: ../2026-09-02_verify-visual-blind-spot/notes.md"
  - "Prior work: ../2026-08-27_feedback-loop-layers/notes.md"
  - "~/notes/inbox/Verification in agentic engineering/Verification split - behaviour, static correctness, quality.md"
  - "~/notes/inbox/Verification in agentic engineering/Artefact hook on top of a gate.md"
  - "aiwork plugin: skills/aiwork-protocol/SKILL.md (the `verified:` table)"
  - "aiwork plugin: hooks/verified-gate.mjs (ON_APP_PASSES)"
---

# Two missing passes in `/verify`: UX taste, and Czech copy

`.claude/skills/verify/SKILL.md` runs two passes — behaviour and appearance.
Both are defect hunts: they answer _is anything broken_. Nothing in this repo
answers **does it feel right**, and nothing checks **user-facing Czech text**
at the moment it is produced. This task adds both.

## Where this sits

`2026-09-02_verify-visual-blind-spot` closed the previous hole: appearance was
in scope but never executed, so Pass 2 was written. That is the _defect_ half
of the visual axis and it is done. This task is the _taste_ half plus copy —
what Pass 2 deliberately does not reach.

The axis already has a name and a slot. `aiwork-protocol`'s `verified:` table
defines `ux` = "user-facing result judged by driving the app", and the
plugin's `verified-gate` hook counts it as an on-app pass
(`ON_APP_PASSES = ["behaviour", "ux", "human"]`). The slot exists and nothing
fills it: no skill anywhere defines what a `ux` pass consists of.

## What Pass 2 already covers, and what it does not

Pass 2's stance is right — "Not the diff, not the spec: this pass has the same
checklist for every ticket" is exactly the source note's _"it checks what the
spec did not say"_. Of the note's five elements it covers two:

| Element      | Pass 2 today                                            |
| ------------ | ------------------------------------------------------- |
| spacing      | yes — "spacing and sizing off vs neighbouring pages"    |
| empty states | yes — "error, focus, and loading states visible"        |
| flow         | no — judges each screenshot as a page, never a sequence |
| copy         | no — nothing looks at wording                           |
| references   | no — only comparator is neighbouring pages              |
| "feel right" | no — every verb is defect-shaped (clipped, broken)      |

So Pass 2 is the UX axis restricted to one page's visual state.

## Decisions

| Decision                  | Choice                                                                         | Rationale                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Where the UX pass lives   | Extend this repo's `verify`, not the marketplace plugin                        | Same argument as the prior task's dead end #6: a plugin edit encodes a per-repo concern and binds only sessions entering through one skill |
| Page-level vs flow-level  | Page-level taste extends Pass 2; flow-level walkthrough is its own pass        | The source note: passes judging the whole result "usually land in their own ticket"                                                        |
| Does `ux` gate the build  | No — it reports, it does not block                                             | Note line 32: "taste has no pass/fail". A hard gate trains appending `ux` to get past it                                                   |
| Copy pass scope           | Every change producing user-facing Czech text, no exceptions                   | User requirement. It is cheap and the site is Czech-only                                                                                   |
| Copy pass placement       | Its own pass in `verify`, not a step in one implement skill                    | Must bind ad-hoc edits too, not only pipeline runs                                                                                         |
| Existing passes' evidence | Fix it here too: `verify` must emit `verified:` for the passes it already runs | The new passes' emission is pointless while `behaviour` itself goes unrecorded; same file, same edit                                       |

## Scope

**In**

- A UX pass answering "does it feel right", with references as an input.
- A copy/typography pass over user-facing Czech text, run whenever such text changed.
- Emitting the right `verified:` values so the evidence is recorded — including
  for the two passes that already exist. `verify` produces verdicts today but
  never tells anyone to append `behaviour` to the ticket's frontmatter, so the
  `verified-gate` hook sees nothing from it.
- Deciding how the copy pass reaches the `czech-typography` rules (see Open).

**Out**

- Changing the aiwork plugin, its hook, or `ON_APP_PASSES`.
- `implement-spec-to-pr`. Its Step 5.3 is a weaker inline screenshot line that
  never calls `verify`, so it would bypass these passes — but the skill is
  superseded: this project's work runs through the aiwork plugin's
  `/implement-spec` (the same finding as `2026-09-02_verify-visual-blind-spot`,
  dead end #5: "that skill was never invoked"). Not worth fixing.
- Rewriting Pass 1 or Pass 2's existing checklists.
- Any mechanical/automated typography linter.

## Open questions

1. **`czech-typography` is `disable-model-invocation: true`.** The skill cannot
   be model-invoked — only the user can trigger it. A copy pass that must run
   "every time" therefore cannot call it as-is. Options: flip the flag, inline
   the rules into the copy pass, or have the pass reference the file by path.
2. **What are the references for taste?** The note calls for "taste and
   references as input". This project has no design file. Candidate: the site's
   own established pages as the corpus, named explicitly rather than implied.
3. **Does the copy pass also cover tone/wording**, or only typography? The
   repo already has commits like `copy(auth): clarify the post-registration
message`, so wording is being judged by hand today.

## Acceptance criteria

- [ ] `verify` defines a UX pass that asks "does it feel right" and takes references as input.
- [ ] The UX pass judges flow across pages, not only single screenshots.
- [ ] `verify` defines a copy pass covering Czech typography and wording.
- [ ] The copy pass triggers on any change producing user-facing text, and SKIPs explicitly (naming files) when none changed.
- [ ] The `czech-typography` invocation problem (Open 1) is resolved, not worked around silently.
- [ ] `verify` emits `verified:` values for the passes it already runs, so `behaviour` reaches the ticket frontmatter.
- [ ] Each new pass emits its own verdict and its `verified:` value; a failing pass does not silently pass the whole verify.
- [ ] `CLAUDE.md`'s Verification section names the new passes, consistent with how it names the existing buckets.
- [ ] The passes are demonstrated on a real change, not only described.
