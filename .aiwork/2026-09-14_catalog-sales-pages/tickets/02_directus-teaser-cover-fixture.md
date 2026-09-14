---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
  - "Directus docs: ../../../docs/directus.md"
---

# 02 — Directus prep: teaser field, public cover folder, fixture Course

**What to build:** an Author opening a Course in Directus finds one plain text box for the teaser, a cover picker that opens in a folder the public can read, and a published `[TEST]` Course that looks like a real offer.

- `course.description` becomes the **teaser**: its interface changes from rich text to plain multiline, and its Czech note says it appears on the Catalog card, at the top of the Sales Page and as the meta description.
- A `Public/kurzy` folder exists, is pinned as the `cover` field's default folder, and the field note says why covers must live there.
- The existing published `[TEST]` Course (the one the probes pin) is edited, not duplicated: it gains a teaser, a price, a cover stored in `Public/kurzy`, and a few Sections with both video and text Lessons. The fixture list in the Directus docs describes the enriched shape. The client's own dummy Course stays untouched and draft.
- Schema and permission changes land in the committed Directus dump.

## Acceptance criteria

- [ ] The teaser field renders as plain multiline in the Directus admin with the reworded note
- [ ] The cover picker opens in `Public/kurzy` and the note explains the folder
- [ ] Probe: a file in `Public/kurzy` is fetchable without a token; a file in the materials folder is not
- [ ] The published `[TEST]` Course has teaser, price, cover and an outline with video and text Lessons; existing probes still pass
- [ ] Fixture list in the Directus docs updated; committed dump reflects the schema changes
