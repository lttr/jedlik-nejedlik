---
status: done
verified: [checks, behaviour]
verified_flow: /kurzy/test-kurz-publikovany bespoke block between hero and outline (default + 375), same page complete without block after a local key rename, orphan-key console.warn on /kurzy in dev, warning absent from built bundles
blocked_by: [04]
references:
  - "Spec: ../spec.md"
---

# 06 — Bespoke sales content registry and slot

**What to build:** a Course that needs richer persuasion carries a hand-built Vue component in the middle of its Sales Page, between the hero and the outline. Components live in the `shop` layer and are resolved through an explicit registry mapping slug to component, so a developer sees at a glance which Courses are hand-built. A slug missing from the registry is a valid state and the page renders complete without the block. In development, the registry warns when one of its keys matches no Course. No build-time consistency check.

## Acceptance criteria

- [x] Registry maps slug → component; a bespoke component for the fixture Course renders in the slot between hero and outline
- [x] A Course without a registry entry renders a complete Sales Page with no bespoke block
- [x] Development-only warning when a registry key matches no Course; silent in production
- [x] Unit test covers registry hit and miss
- [x] No price appears in bespoke copy; the skeleton still owns cover, title, teaser, price, outline and button
- [x] Verified in the running app with and without a registry entry
- [x] `vp run check:all` passes
