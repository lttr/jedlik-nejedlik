---
status: done
verified: [checks, behaviour]
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

- [x] The teaser field renders as plain multiline in the Directus admin with the reworded note
- [x] The cover picker opens in `Public/kurzy` and the note explains the folder
- [x] Probe: a file in `Public/kurzy` is fetchable without a token; a file in the materials folder is not
- [x] The published `[TEST]` Course has teaser, price, cover and an outline with video and text Lessons; existing probes still pass
- [x] Fixture list in the Directus docs updated; committed dump reflects the schema changes

## Verification (2026-09-14)

No Nuxt surface in this ticket, so the `verify` skill's two app passes are SKIP (diff: `directus/config/**`, `web/tests/probes/**`, `docs/directus.md`). Behaviour evidence is the live instance instead, observed with the admin token for `/fields` and anonymously for everything else:

- `GET /fields/course/description` → `interface: input-multiline`, `options: {trim, placeholder}`, note „Upoutávka kurzu: 2–3 věty prostým textem …“. The admin rendering is evidenced by the field meta only; no admin-app login was available.
- `GET /fields/course/cover` → `options.folder = 59ffe3f9-4f57-44c4-8b01-2f019979d425` (`Public/kurzy`), note explaining the folder-scoped public read.
- Anonymous `GET /assets/749f89ba-…` (cover in `Public/kurzy`) → 200; anonymous `GET /assets/c1cee206-…` (materials folder) → 403. Asserted in `web/tests/probes/public-cover.probe.ts`.
- Anonymous `GET /items/course/1` → plain-text teaser, `price_czk: 1490`, `sort: 1000`, `cover` 1200×675 in the kurzy folder, three sections with `video` and `text` lessons. Anonymous course list shows only `test-kurz-publikovany`.
- `vp run directus:probe`: 5 files, 94 tests passed (existing four suites untouched). `vp run check:all` green.
- `vp run directus:pull` diff carries only `folders.json` (+kurzy), `fields/course/description.json`, `fields/course/cover.json`; no incidental drift. No permission change was needed: the Public `directus_files` rule already matches a folder whose parent is named `Public`.
