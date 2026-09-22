---
status: done
references:
  - "Previous pass (60-word rule, spec headers kept): ../2026-09-22_comment-lint-codebase/spec.md"
  - "Skill: ../../.claude/skills/lint-comments/SKILL.md"
---

# Spec — Shorten the comments, and fewer of them

## Why

The first full pass (`2026-09-22_comment-lint-codebase`) kept every comment
over 40 words that carried a reason, on a 60-word rule, and rejected most
`remove` findings whose co-reason was weak. The result is a codebase where the
shop layer alone still has ~110 flagged comments, many of them 60–140-word
prose headers that do a doc's job in a source file.

This pass reverses the bias: **every comment is cut to the reason a reader of
that file needs, and detail that explains an area rather than a line moves to
`docs/`.** The goal is fewer and shorter comments, not zero.

## Rules

- `shorten` — cut to ≤ 40 words, one or two sentences. Where the cut would
  lose an area-level explanation (a flow, a contract between routes, a cookie
  lifecycle, a gateway protocol), the explanation moves to a section in
  `docs/` and the comment becomes one line plus a pointer.
- `remove` — delete unless the comment guards a non-obvious safety or
  correctness property (a race, a security rule, a legal requirement). UI
  rationale and "why this component exists" do not qualify.
- `rewrite` (undefined term) — GLOSSARY headwords and ADR numbers are defined;
  leave the term, but shorten the sentence around it if it is flagged for
  length too.
- No `lint-comments: keep` markers. A finding left standing goes in `notes.md`.

## Docs created

- `docs/shop.md` — the shop layer: catalog read path, checkout, pending
  checkout cookie, payment and settlement, return page, mock gateway, sales
  content, price and image conventions.
- `docs/analytics.md` — cookie consent, Meta Pixel, Clarity, ignored hosts,
  Live Course tracking table.

## Areas

| area                                                                    | flagged |
| ----------------------------------------------------------------------- | ------: |
| `web/app`, `web/server`, `web/shared`, `web/layers/{auth,directus,lms}` |      52 |
| `web/layers/shop/server`                                                |      40 |
| `web/layers/shop/app`                                                   |      44 |
| `web/layers/shop/{shared,mock-gopay,nuxt.config.ts}`                    |      23 |
