---
status: done
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

- [x] Author role: full CRUD on `course`/`section`/`lesson` + file uploads;
      read on `order`/`order_consent`/`entitlement`; create/delete on
      `entitlement`; no instance administration
- [x] Author probes green (content CRUD allowed, transactional writes beyond
      entitlement denied)
- [x] Dummy course built by the author through the admin app: sections
      covering every unlock-rule value, video and text Lessons, at least one
      Material — without developer intervention
- [x] Authoring friction encountered is recorded as findings (spec-level,
      not a footnote)
- [x] Manual Entitlement grant to a test Student performed by the author in
      the admin app
- [x] directus-sync dump re-pulled and committed (role/policy changes)

## Closing note

Done 2026-08-19. The author built course id 6 through the admin app
unaided; all four unlock rules, both lesson types, a material in the
Materiály kurzů folder, and a manual entitlement grant are in place. Four
authoring findings recorded in `../implementation-notes.md` and carried
into ticket 05.

Accepted as incomplete by the user (see the notes for the full list): the
course stays `draft` with price/threshold/cover unfilled, and the manual
_revocation_ half of the grant path was not exercised. Probe fixtures
(entitlement id 1, courses 1 and 2) are untouched.
