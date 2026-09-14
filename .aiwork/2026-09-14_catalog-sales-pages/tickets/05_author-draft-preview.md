---
status: ready
blocked_by: [04]
references:
  - "Spec: ../spec.md"
  - "ADR 0004: ../../../docs/adr/0004-course-pages-read-through-nitro.md"
---

# 05 — Author draft preview

**What to build:** an Author who logs in sees draft Courses in the Catalog with a „Koncept" badge in their normal sort position, and a draft Sales Page renders instead of 404. A Student or a visitor sees neither. Directus decides this from the caller's own token; the app adds no authorization logic, only the badge.

## Acceptance criteria

- [ ] Logged-in Author: draft Course card shows a „Koncept" badge in its normal position; its Sales Page renders
- [ ] Logged-in Student and anonymous visitor: draft Course absent from the Catalog, its Sales Page 404s
- [ ] Probe: Author token reads a draft Course and its outline; Student and anonymous tokens do not, asserting status and error codes
- [ ] Verified in the running app as Author, Student and visitor
- [ ] `vp run check:all` passes
