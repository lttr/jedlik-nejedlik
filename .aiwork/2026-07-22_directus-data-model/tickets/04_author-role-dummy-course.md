---
status: ready
blocked_by: [03]
references:
  - "Spec: ../spec.md"
---

# 04 — Author role + dummy course through the admin app (FP-11)

**What to build:** the author manages course content entirely in the Directus
admin app — no developer involved — and proves it by building the dummy
course that seeds all downstream areas. The author can also grant an
Entitlement manually (the manual unlock/support path).

## Acceptance criteria

- [ ] Author role: full CRUD on `course`/`section`/`lesson` + file uploads;
      read on `order`/`order_consent`/`entitlement`; create/delete on
      `entitlement`; no instance administration
- [ ] Author probes green (content CRUD allowed, transactional writes beyond
      entitlement denied)
- [ ] Dummy course built by the author through the admin app: sections
      covering every unlock-rule value, video and text Lessons, at least one
      Material — without developer intervention
- [ ] Authoring friction encountered is recorded as findings (spec-level,
      not a footnote)
- [ ] Manual Entitlement grant to a test Student performed by the author in
      the admin app
- [ ] directus-sync dump re-pulled and committed (role/policy changes)
