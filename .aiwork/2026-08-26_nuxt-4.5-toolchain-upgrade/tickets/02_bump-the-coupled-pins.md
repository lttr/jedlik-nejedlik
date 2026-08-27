---
status: done
blocked_by: [01]
references:
  - "Spec: ../spec.md (the four coupled pins, gotchas 2 7 8, order of work step 1)"
---

# 02 — Bump the four coupled pins and settle the lockfile

**What to build:** a tree that installs cleanly on Nuxt 4.5.2 and vite-plus 0.3.0, with a lockfile a clean `pnpm i --frozen-lockfile` reproduces. Nothing in this ticket promises a green build — `peerDependencyRules.allowAny` means a wrong Vite installs happily and only fails later, so a successful install proves nothing on its own. Getting green is ticket 03; this ticket deliberately stops at the version numbers so the diff a reviewer reads is only the versions.

All four rows move together or none do. Bump the named packages by hand — do **not** run `npx nuxt upgrade --dedupe`, which knows nothing about our catalog, overrides or `peerDependencyRules` and would walk straight into the rows this repo pins on purpose.

## Acceptance criteria

- [x] Catalog `vite-plus` moved to 0.3.0 in `pnpm-workspace.yaml`
- [x] `rolldown` in `web/package.json` moved to exact 1.2.5 — still exact, never a range — with a comment saying the number tracks whatever vite-plus bundles and moves when the catalog moves
- [x] `@nuxtjs/seo` moved to 5.3.14, lifting its exact pin; lockfile shows a single `unhead` resolving to v3
- [x] Nuxt group moved to 4.5.2 and friends, including everything listed under "What rides along" in the spec
- [x] `pnpm dedupe` run once and the lockfile diff read, not skimmed
- [x] `pnpm i --frozen-lockfile` succeeds from a clean state, matching what Nixpacks will do
- [x] Exact commands quoted in the commit body; no source or config changes beyond the version rows
