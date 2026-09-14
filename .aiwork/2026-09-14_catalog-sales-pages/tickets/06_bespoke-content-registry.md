---
status: ready
blocked_by: [04]
references:
  - "Spec: ../spec.md"
---

# 06 — Bespoke sales content registry and slot

**What to build:** a Course that needs richer persuasion carries a hand-built Vue component in the middle of its Sales Page, between the hero and the outline. Components live in the `shop` layer and are resolved through an explicit registry mapping slug to component, so a developer sees at a glance which Courses are hand-built. A slug missing from the registry is a valid state and the page renders complete without the block. In development, the registry warns when one of its keys matches no Course. No build-time consistency check.

## Acceptance criteria

- [ ] Registry maps slug → component; a bespoke component for the fixture Course renders in the slot between hero and outline
- [ ] A Course without a registry entry renders a complete Sales Page with no bespoke block
- [ ] Development-only warning when a registry key matches no Course; silent in production
- [ ] Unit test covers registry hit and miss
- [ ] No price appears in bespoke copy; the skeleton still owns cover, title, teaser, price, outline and button
- [ ] Verified in the running app with and without a registry entry
- [ ] `vp run check:all` passes
