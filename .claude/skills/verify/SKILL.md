---
name: verify
description: Verify a change to the jedlik-nejedlik site in the running app — two passes, behaviour (is the spec implemented) and appearance (does the page look right), each with its own verdict. Use before committing any change under web/ with a runtime surface.
argument-hint: [ticket-or-spec-path]
---

Two passes, two verdicts. Either failing fails the whole verify.

Out of scope: `vp run check:all` (static) and `vp run directus:probe`
(permissions). They do not replace this and this does not replace them.

## Prerequisites

- Dev server running and driven per `run-jedlik-nejedlik` (needs
  `NUXT_PUBLIC_DIRECTUS_URL` in the environment; ask, never invent).
- `agent-browser` available (bundled with Vite+).
- A diff with a runtime surface: a page, a component a page renders, or a
  server route. Docs, tests, config only → SKIP and name the files.
- The claim to verify: `$ARGUMENTS` as a path to a ticket, spec, or any file
  with acceptance criteria, or the user's description of the change. With
  neither, the diff itself is the claim; say so in the report. (When the
  `aiwork-protocol` is in use, the `status: in-progress` ticket is the
  default argument.)

## Pass 1 — Behaviour: is the spec implemented?

Input: the spec's acceptance criteria and the diff (`git diff master...`).

1. Map each criterion to the route and state where a visitor meets it. Follow
   an internal change up to every route that renders it.
2. Drive each one through the browser, the smallest path that executes the
   changed code. Happy path and error path: empty submit, bad input, repeat
   with stale state. Curl only for routes a browser cannot reach.
3. Verdict per criterion, with the observed output as evidence. A criterion
   with no observation is not passed.

## Pass 2 — Appearance: does it look right?

Input: every page Pass 1 touched, in every state it reached. Not the diff,
not the spec: this pass has the same checklist for every ticket. If Pass 1
reached no page (server route only, no page renders it) this pass is SKIP;
say so and name the routes.

1. Screenshot each route and state at the default viewport and at 375px
   (`agent-browser set viewport 375 800`).
2. Read every screenshot back and judge it as a page, not a DOM:
   - anything overlapping, clipped, or overflowing the viewport
   - layout broken or cramped at 375px
   - spacing and sizing off compared with neighbouring pages
   - error, focus, and loading states visible and legible
3. One sentence per screenshot saying what it looks like. An unread
   screenshot is not evidence.

## Report

Two verdicts (PASS / FAIL / BLOCKED / SKIP), the per-criterion table, the
screenshot sentences with paths, and findings. Screenshots are working
evidence, not repository content: put them in the task folder's
`screenshots/` when there is one (gitignored), else in the session scratchpad.
When in doubt, FAIL.
