---
status: in-progress
references:
  - "Prior work: ../2026-08-20_verify-feedback-loops/recommendations.md"
  - "Prior work: ../2026-08-27_feedback-loop-layers/notes.md"
  - "Area that surfaced it: ../2026-08-19_auth-customers/tickets/06_round-trip-verification.md"
  - "~/notes/inbox/Verification split - behaviour, static correctness, quality.md"
  - "claude-marketplace: plugins/aiwork/skills/implement-spec/SKILL.md"
---

# Visual regressions pass every gate: why, and where the fix belongs

A design bug shipped through the full `/implement-spec` pipeline on the auth
area and was found weeks later by eye. This is the investigation of why no
gate caught it. The bug itself is fixed on `feat/area-02-auth`; these notes
are about the process hole.

## The bug, in one paragraph

Every auth page put `class="p-stack"` on its `<form>`. Puleo already styles
`:where(form)` as a flex column with `gap: var(--form-gap, var(--space-4))`,
and `.p-stack > * + *` adds `margin-block-start: var(--stack-space)`. The two
compose: **29.5px gap + 29.5px margin = 59px between every form row**, against
a 9.8px label-to-input gap. `AuthPanel` carried `p-stack` too, where
`.p-stack:only-child { block-size: 100% }` stretched the card **108px taller
than its content**. Nothing was broken; it just looked wrong.

## Why every gate missed it

| Gate                                                                    | Why it could not catch this                                            |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `vp run check:all`                                                      | No mechanical verdict exists for "the card is 108px too tall"          |
| Directus probes                                                         | Wrong layer entirely                                                   |
| `/code-review xhigh` (wrap-up)                                          | Reads a diff. `class="p-stack"` on a form is plausible, idiomatic code |
| `/verify` + "confirm each acceptance criterion against actual behavior" | See below — this is the one that should have caught it                 |

The auth spec and all six tickets contain **zero** acceptance criteria about
rendered appearance. Grepping the four relevant skills — `implement-spec`,
`implement`, `to-tickets`, `aiwork-protocol` — for
`screenshot|browser|render|visual` returns **0 hits in all four**.

## The actual root cause

Not a missing verification bucket. Per the verification-split note, the three
buckets are divided by **mode of judgement**, not subject matter, and layout
already sits inside _behaviour_:

> **chování / behaviour**: `/verify`. Build it, run it, drive it. Catches what
> only shows at runtime: hydration mismatch, a piece of data that is null,
> **layout broken at 375px**.

So visual checking was in scope the whole time. The failure was
**under-executing the behaviour bucket**: the 2026-08-28 session did drive the
real app in a browser, and recorded _text_ outcomes ("the page answers with the
Czech 'Poslali jsme vám…' panel"). That is reading the DOM, not looking at the
page. `agent-browser screenshot` was one command away and never run.

Two things made that easy to do:

1. **This repo has no project verify skill.** `.claude/skills/` holds six
   skills; `verify` is not among them. The built-in `/verify` describes itself
   as _"exercising it end-to-end and observing behavior — drive the affected
   flow… bootstraps this repo's project verify skill if none exists yet."_ That
   bootstrap never happened, so every `/verify` in the ticket loop ran generic
   prose that knew nothing about `check:all`, `run-jedlik-nejedlik`, or the
   probes.
2. **CLAUDE.md dropped the examples.** The source note reads "Catches what only
   shows at runtime: hydration mismatch, a piece of data that is null, layout
   broken at 375px." The repo's copy kept the abstract clause and lost all three
   examples — including the only one that makes visual scope explicit. Abstract
   "runtime" reads as _does the flow work_.

## Dead ends, so they are not re-walked

- **A fourth "Visual" bucket.** Wrong: it partitions by subject matter, which
  the split note explicitly rejects. Layout is already behaviour.
- **"Extend `/verify` from behaviour to design."** Nothing to extend —
  `/verify` _is_ the behaviour bucket and runtime appearance is already inside
  it. It needs executing, not widening.
- **A per-ticket visual acceptance criterion via `/to-tickets`.** Rejected:
  "does this look right" is a gate, not a deliverable. It must be implicit for
  every ticket, which makes it a pipeline concern.
- **`implement-spec-to-pr` Step 5.3.** This project skill _does_ mandate
  screenshots and a "Verification evidence" table (added 2026-08-25,
  `5689d14`), and the auth folder has neither. Irrelevant: that skill was never
  invoked — the work ran through the aiwork plugin's `/implement-spec`.
- **A new step in `/implement-spec`.** Same content, worse place: binds only
  sessions entering through that skill (not `/implement`, not ticket-driven
  rework), and edits a shared marketplace plugin to encode a per-repo concern.

## Proposed fixes

1. **Bootstrap `.claude/skills/verify/SKILL.md`.** The designed extension
   point, currently unused, and it applies to _every_ `/verify` call — ticket
   loop, `/implement`, ad-hoc — with no plugin edit. Should make the existing
   behaviour bucket executable for this repo: start via `run-jedlik-nejedlik`;
   drive the affected flow; screenshot every changed route **and read the
   screenshot back, stating what the page looks like**; check 375px; route to
   `check:all` and the probes.
2. **Restore the dropped examples** to CLAUDE.md's behaviour bullet. A restored
   clause, not a new bucket.

The load-bearing clause is "read it back and say what it looks like".
Capturing a PNG is what the August session would have done; looking at one is
what found the bug.

## Applied 2026-09-02

- Fix 1: `.claude/skills/verify/SKILL.md` written by hand (verified against
  Claude Code 2.1.258: `/verify` reads and creates exactly that path; `run-*`
  skills are launch primitives only). A "Verify a change" section briefly
  committed into `run-jedlik-nejedlik` (441afd3) was moved out again.
- Fix 2: CLAUDE.md behaviour bullet points at `/verify` and carries the three
  examples again.
- Open: a PostToolUse hook that, after `agent-browser screenshot <path>`,
  reminds the agent to Read the image and describe it — the one mechanical
  nudge available for the load-bearing clause.

## Caveat

Neither fix is mechanically enforced — both are instructions an agent can
under-execute exactly as this one did. The honest expectation is a better
prompt at the right moment, not a gate.
