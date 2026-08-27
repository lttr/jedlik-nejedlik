---
status: done
blocked_by: [02]
references:
  - "Spec: ../spec.md (gotchas 1 4 9 10, order of work steps 2 and 3, verification)"
---

# 03 — Get the new toolchain green in the browser

**What to build:** the site building, rendering and verifying on the new toolchain. Ticket 02 left the tree installed but unproven; this ticket closes that window and is where the real risk lives — unhead 2 → 3 carries per-request context through a module singleton, and the Vite mismatch fails at build rather than install.

Two commits, kept apart so the interesting one can be read on its own: first the mechanical formatting and lint pass, then the code repair. New oxlint 1.77.0 and oxfmt 0.62.0 flag code that passes today, and our config sets around seventy explicit rules on top of the enabled categories — a rule renamed upstream surfaces as an unknown-rule warning rather than a failure, so read the `vp check` output, not just its exit code.

`vp run verify:all` is the gate but is not sufficient. Typechecking never sees a rendered `<head>`, and no unit test exercises unhead's request context.

## Acceptance criteria

- [x] Formatting and lint fixes from `vp check --fix` committed on their own, separate from the code repair
- [x] `vp check` output read for unknown-rule warnings, and any renamed rules updated in the lint config
- [x] unhead v3 stricter `useHead` typing resolved across the eight `useHead` / `useSeoMeta` call sites in `web/app/layouts/` and `web/app/pages/`
- [x] `vp run verify:all` green
- [x] Browser pass over `pnpm dev:agent`: a page using `useSeoMeta`, a page rendering a Directus image, and one form
- [x] Rendered `<head>` inspected on a page using `@nuxtjs/seo` and confirmed correct — the whole unhead risk lands here
