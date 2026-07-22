---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
---

# 01 — Config-as-code baseline (directus-sync)

**What to build:** the production Directus instance's configuration becomes a
committed, diffable artifact in the repo, before any Kurzy schema exists —
so every later ticket's permission and schema changes land as reviewable
diffs against this baseline.

## Acceptance criteria

- [ ] Directus instance version checked; either ≥ 11.16.1 or directus-sync
      pinned to a compatible release (record which in implementation notes)
- [ ] `directus-extension-sync` installed on the instance
- [ ] directus-sync configured **pull-only** in the repo (no push workflow)
- [ ] Baseline dump of the current (pre-Kurzy) instance config committed
- [ ] `diff` against the instance reports clean immediately after pull
