---
status: ready
blocked_by: [03]
references:
  - "Spec: ../spec.md"
  - "ADR 0004: ../../../docs/adr/0004-course-pages-read-through-nitro.md"
---

# 04 — Sales Page at `/kurzy/<slug>`

**What to build:** a visitor opens a Catalog card and lands on `/kurzy/<slug>`, which presents one Course: cover, title, teaser, price, the full Section and Lesson outline with video and text Lessons visibly distinguished, and a „Koupit kurz" button linking to the order route area 04a will own. A slug with no readable published Course returns the site's normal 404 through `createError`; missing and unpublished are indistinguishable and there is no redirect.

The page uses the same session-derived Nitro read path as the Catalog. The skeleton owns cover, title, teaser, price, outline and the button, and leaves one empty slot between the hero and the outline for ticket 06. No session or entitlement check on the button in this area.

## Acceptance criteria

- [ ] `/kurzy/<slug>` renders cover, title, teaser, formatted price, outline and „Koupit kurz" for the fixture Course
- [ ] Video and text Lessons are distinguished in the outline
- [ ] Unknown slug returns the site's 404 page; no redirect to the Catalog
- [ ] Catalog cards link to their Sales Page
- [ ] The price reaches the page only through the shared formatter
- [ ] Verified anonymously in the running app, including at 375px
- [ ] `vp run check:all` passes
