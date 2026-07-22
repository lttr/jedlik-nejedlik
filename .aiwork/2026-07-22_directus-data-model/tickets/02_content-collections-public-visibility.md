---
status: done
blocked_by: [01]
references:
  - "Spec: ../spec.md"
---

# 02 — Course content collections + public visibility

**What to build:** an anonymous visitor can read a published Course's outline
(titles, ordering, lesson types) over the Directus REST API, but is denied
every paid field — lesson bodies, video UIDs, Materials. This is the
catalog-facing half of the enforcement boundary.

## Acceptance criteria

- [x] `course`, `section`, `lesson` collections exist per the spec's field
      list, grouped in a `kurzy` collection folder, with Czech admin labels
- [x] Section carries `unlock_rule` (immediate | test | manual |
      time_since_purchase) + `unlock_delay_days` as config only
- [x] Lesson references video by Stream UID string only; Materials are an
      M2M to Directus files
- [x] Public role reads published courses and the section/lesson outline;
      API-level denial on `lesson.body`, `lesson.video_uid`, Materials, and
      on draft courses
- [x] `directus` layer Schema + zod codecs extended for the three
      collections (wire types derived via `z.input`); typecheck passes
- [x] Vitest probe harness established in the web app (role tokens via env,
      run on demand); anonymous probes green against production
- [x] Schema snapshot + directus-sync dump re-pulled and committed
- [x] `_scaffold` placeholder pages and their route rules removed from the
      `customers`, `lms`, and `shop` layers
