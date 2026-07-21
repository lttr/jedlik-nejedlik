---
status: done
blocked_by: []
references:
  - "Spec: ../spec.md"
---

# 02 — Domain layer skeletons

**What to build:** the three empty-but-wired domain layers — `customers`,
`lms`, `shop` — each proving its wiring with one placeholder page at
`/_scaffold/<layer>` that renders the layer name. Placeholder pages are
hidden from crawlers (robots `false`, absent from the sitemap) and will be
deleted when each layer's first real page lands (areas 02, 03, 06).

No auth, catalog, or player code — just the merged layer structure the
later areas build inside, with the existing marketing site unaffected.

## Acceptance criteria

- [x] `vp run build` and `vp run typecheck` pass
- [x] `/_scaffold/customers`, `/_scaffold/lms`, `/_scaffold/shop` render
- [x] Scaffold routes absent from `/sitemap.xml` and disallowed for robots
- [x] Existing pages render unchanged in dev
- [x] Merged to `master`, Coolify deploy green, production pages unchanged
