---
status: not-started
references:
  - "Findings inventory: findings.md (graded at f043976)"
  - "Skill: ../../.claude/skills/lint-comments/SKILL.md"
  - "Glossary the linter cannot see: ../../GLOSSARY.md"
---

# Spec — Comment lint pass over the whole codebase

## Why

`lint-comments` has only ever run on a diff, from the pre-commit hook, so it has
graded the comments written since the hook landed and nothing older. A full run
over `web/` plus the root configs grades the whole body of comments once.

A run at `f043976` covered **248 of the 252 gradable files the repo tracks**
(the 4 skipped are `.aiwork/` prototypes — see "Scope"; `findings.md` records
the audit). It flags **352 comments / 428 findings** across 140 files:

| rule               |   n | notes                                                          |
| ------------------ | --: | -------------------------------------------------------------- |
| `remove`           | 159 | 56 "restates the code", 59 "answers a question no reader asks" |
| `shorten`          | 143 | flat >40-word trip; median 56, max 142                         |
| `rewrite`          |  91 | 56 "leans on an undefined term", 48 "hard to follow"           |
| `duplicate`        |  24 | Sentry boilerplate, plus 3 one-liners repeated across forms    |
| `dead-code`        |   6 | commented-out markup, one style rule, 2 false positives        |
| `todo-without-ref` |   5 |                                                                |

That is too much for one commit and too much to accept unfiltered. This spec
fixes which rules apply here, then cuts the work into per-area commits.

## Rule decisions

Two rules need a decision before any ticket runs, so no ticket re-argues them
comment by comment.

### 1. `rewrite → "leans on an undefined term or reference"` (56 findings)

My first read of these was wrong. The rule is not asking "is this word in the
glossary" — it is asking **"would a reader new to the file know what this
capitalised term means, in the sense used here."** Two different defects hide
under it, and they need opposite fixes.

**1a. The term is capitalised domain vocabulary that is defined nowhere —
16 findings.** This is the rule earning its place. Checked against
`GLOSSARY.md`'s 23 headwords, the comments lean on:

| term              | capitalised uses in `web/` | defined in    |
| ----------------- | -------------------------: | ------------- |
| `Checkout`        |                         48 | nowhere       |
| `Payment`         |                         42 | nowhere       |
| `Settlement`      |                          5 | nowhere       |
| `Unverified`      |                          4 | nowhere       |
| `Service Account` |                          2 | ADR 0006 only |

Not in `GLOSSARY.md`, not in `../2026-09-15_checkout-gopay/spec.md`, not in
`docs/`. The whole checkout and payment area writes its central nouns as proper
terms and never defines them, while `Order`, `Consent` and `Entitlement` beside
them are defined. **The defect is the missing glossary entries, not the
comments** — so the fix is ticket 00 below, and these 16 findings dissolve once
it lands. Do not rewrite these comments to avoid the terms.

**1b. The term is a glossary headword — 40 findings.** `Course`, `Student`,
`Account`, `Author`, `Catalog`, `Sales Page`, `Entitlement`, `ADR 0006`,
`spec, "Settlement"`. Capitalisation is the house convention that tells a
reader to look the term up, and the linter has no glossary to look in.

These are **not automatically rejected.** For each, confirm the term carries
its glossary sense, because a glossary term used loosely is worse than an
undefined one — it reads as precise and is not. The axis that actually bites
here is `Account` vs `Student`: `Account` is any identity that can log in,
including a staff Author, and `Student` is only the Account that learns and
buys. A comment in the auth layer that says "Student" where the code serves
any Account is a real bug in the comment. Same for `Course` where the code
means specifically a `Live Course`, and `Order` vs `Payment`.

Reject the finding where the sense holds; treat it as a genuine `rewrite`
where it does not.

I spot-read about half of the 40 on this axis and the distinction held up
well — `auth/app/composables/account.ts:10` and `auth/server/utils/
registration.ts:37` argue it explicitly and cite `GLOSSARY.md` — so I expect
few hits. The mechanical check for undefined terms covered all 56; the
sense check did not, and belongs in each ticket.

One candidate spotted while reading: `auth/app/composables/auth.ts:29` writes
lowercase "account" and capital "Account" in one sentence and leans on
`Unverified`. Settle it in ticket 03.

### 2. `shorten` (143 findings) — narrowed to >60 words (64 findings)

And then only where the length is restatement. Spec-anchored prose headers on
server utils and probes are deliberate: they carry the why that the code
cannot. Cutting every block under 40 words would delete documentation, not
fluff. Where a long header is genuinely doing a doc's job, move the detail to
the area spec or `docs/` and leave a pointer, rather than truncating it.

### The rest

`remove`, `duplicate`, `dead-code` and `todo-without-ref` apply as written.
On `remove → "it is a reason, not a description"`: the reason is the part worth
keeping, so weigh that finding on its co-reason ("restates the code" /
"answers a question the reader would not ask") alone.

Two `dead-code` findings are false positives: `email-subjects/index.js:24`
and `:31` are real JSDoc `@type` / `@param` annotations, and the grader says so
itself at 32% and 36% confidence.

After these decisions, **~195 findings are in scope**, plus ticket 00.

Per the skill: never add `lint-comments: keep` markers. A finding left standing
is recorded in the ticket's notes instead.

## Scope

Every gradable file the repo tracks — JS/TS/MJS/CJS, CSS, `.vue`, `.html` — so
`web/` and the root configs, and also `certificate/`, `directus/extensions/`,
`directus/sync.config.cjs` and `.claude/skills/*/scripts/`. Markdown, JSON and
YAML are not graded, so `docs/` and the rest of `.aiwork/` fall outside by
construction.

Deliberately excluded:

- **`web/archive/`** — dead code kept for reference; 1 finding, not worth a diff.
- **`.aiwork/**/*.html`** — prototypes and wireframes, artifacts rather than
  source.

## Tickets

One per area, each its own `style(<area>): ...` commit. Counts are flagged
comments at `f043976`, before the rule decisions above thin them.

| #   | Area                                                 | flagged |
| --- | ---------------------------------------------------- | ------: |
| 00  | `GLOSSARY.md` — define the missing terms             |      16 |
| 01  | root + web configs, `web/server`, `web/shared`       |      22 |
| 02  | `web/app`                                            |      35 |
| 03  | `web/layers/auth`                                    |      46 |
| 04  | `web/layers/shop/server`                             |      50 |
| 05  | `web/layers/shop/shared`                             |      25 |
| 06  | `web/layers/shop/app` + `mock-gopay` + `nuxt.config` |      65 |
| 07  | `web/layers/directus` + `web/layers/lms`             |      16 |
| 08  | `web/tests`                                          |      44 |
| 09  | `certificate/`                                       |      35 |
| 10  | `directus/` + `.claude/skills/*/scripts/`            |      13 |

**Ticket 00 runs first and the rest are independent, so any order after it.**

- **Ticket 00** adds `Checkout`, `Payment`, `Settlement` and the Account
  verification states (`Unverified` / verified) to `GLOSSARY.md`, in the
  existing headword format with its `_Avoid_:` line, placed beside `Order` and
  `Consent` where they belong. Source the wording from
  `../2026-09-15_checkout-gopay/spec.md` and `docs/adr/`, and decide whether
  `Shop Service Account` graduates from ADR 0006 into the glossary too. It
  touches no code and closes 16 of the 56 findings in 1b by making them true.
  Everything else in this spec is a comment edit; this one is the only ticket
  that changes what the vocabulary _is_, so it wants a human read.

Three notes on the code tickets:

- **Ticket 01** is the cheapest start: 8 of its 22 are Sentry's own wizard
  boilerplate ("Enable logs to be sent to Sentry"), duplicated verbatim across
  `sentry.client.config.ts` and `sentry.server.config.ts`. Delete both copies.
- **Ticket 09** is the odd one out: `certificate/` is a standalone static page
  (plain HTML + JS, no TS or Vue) and 28 of its 35 are one-line annotations in
  `assets/jn-tokens.css` — `13.5 → 30px`, `16px — body`, restating the calc on
  the line above. `app.js:1` already carries a TODO about migrating the page
  into the Nuxt app, so keep the pass to deleting the restatements; do not
  redesign the token file.
- **Ticket 02** owns the `web/` `dead-code` and `todo-without-ref` findings:
  `main.css:79`, `PageWrapper.vue:16-17`, `pro-rodice.vue:50-68` and `172-220`,
  `(homepage)/index.vue:4-12`. The remaining TODOs sit in tickets 09 and 10
  (`certificate/app.js:1`, `directus/extensions/email-subjects/index.js:1`).
  A TODO gets a ticket reference, a resolution, or deletion — decide per TODO,
  don't blanket-delete. Both of those two record a real intention, so a
  reference to this folder or to a new task is the likely answer, not deletion.

**Cross-file duplicates override the batch boundary.** Three one-liners repeat
across `auth` pages and `shop/app/components/checkout/`:

- `"Saves a round-trip; the route enforces it again."` — `muj-ucet.vue:102`,
  `obnova-hesla.vue:102`, `registrace.vue:73`, `RegisterForm.vue:57`
- `"Normalised here too, so the confirmation names what Directus was given."` —
  `obnova-hesla.vue:84`, `registrace.vue:68`, `RegisterForm.vue:51`
- `"Bare title: the page is robots: false, so no og:* tags."` —
  `obnova-hesla.vue:61`, `prihlaseni.vue:55`, `registrace.vue:55`

Whichever ticket runs first resolves all copies of a cluster, including the one
in the other area's files, and says so in its commit body. Keeping one copy near
the shared cause is only an option where a shared cause exists; for these three,
deleting all copies is the likely answer.

## Working a ticket

**The grading run is done.** `findings.md` holds the full output — 352 flagged
comments, 428 findings, graded at `f043976` — so a ticket does not re-run the
tool to discover its work. It reads its area's section, reads each finding
against the code, and fixes.

Re-running costs model calls and re-grades changed comments from scratch, so
the wording of a finding can shift between runs. That makes a repeat run worth
it in exactly two cases:

1. **The ticket rewrote comments rather than deleting them** — then the
   replacement has never been graded. This is already covered: the pre-commit
   hook runs `lint-comments --staged` on every commit and grades exactly the
   comments the ticket touched. Act on what the hook reports inside the same
   ticket, because a comment is graded once, on the commit that introduces it.
2. **The area moved since `f043976`** — new commits landed in it, so the
   snapshot is stale for that path. Check with `git log f043976..HEAD -- <path>`
   before starting; if it is non-empty, re-grade just that path:

   ```sh
   lint-comments <path> --cache --format text
   ```

   `--cache` reuses the existing grades, so only the genuinely changed comments
   cost anything.

Otherwise: no re-run. A finding left standing is recorded in the ticket's notes
with the reason, never with a `lint-comments: keep` marker.

Then `vp run check:all` — formatting may have shifted. Commit as
`style(<area>): ...`.

## Verification

`verified: [checks, review]` per ticket; ticket 00 is `[human]` — it is prose,
there is nothing to check or run. Comment edits have no runtime surface,
with two exceptions. **Ticket 02 needs a behaviour pass**, because its
`dead-code` findings sit inside `.vue` templates and a `<style>` block: drive
the homepage, `/pro-rodice` and one `PageWrapper` page with the `verify` skill
after removing them. **Ticket 09 needs an eyeball on the rendered
certificate**, because the comments being deleted sit among CSS custom
properties and a stray deletion there is invisible to `check:all` — open
`certificate/index.html` and compare.

The pre-commit hook runs `vp staged` and `check:all` in full, so the checks
pass is enforced at commit time rather than needing a separate step.

## Out of scope

- Adding comments where there are none. The linter only grades what exists.
- Moving documentation into `docs/` beyond what a `shorten` fix needs.
- Configuring `lint-comments` (there is no `lint-comments.config.json`).
  Teaching it the glossary, or raising its word threshold, would stop the
  pre-commit hook re-raising decision 1b and decision 2 on every future diff —
  worth doing, but its own task.
