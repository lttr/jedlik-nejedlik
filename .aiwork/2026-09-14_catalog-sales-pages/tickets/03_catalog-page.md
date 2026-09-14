---
status: ready
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
  - "ADR 0004: ../../../docs/adr/0004-course-pages-read-through-nitro.md"
---

# 03 — Catalog at `/kurzy` with „Kurzy" in the main navigation

**What to build:** a visitor clicks „Kurzy" in the main navigation and sees every published Course as a card with cover, title, teaser, price in Czech formatting and lesson count, ordered by the Author's `sort` value. When nothing is published, an explanatory message replaces the list.

The page lives in the `shop` layer and fetches through a Nitro route that builds its Directus client from the caller's session, falling back to the anonymous server client (ADR 0004). The query filters explicitly on published status. Sorting is `sort` ascending, null last, `id` ascending as tiebreaker. Price is rendered by one shared formatter, the only place a price reaches the page. Only On-demand Courses appear; Live Courses stay on their marketing pages.

## Acceptance criteria

- [ ] „Kurzy" appears in the main navigation, added the way area 02 added the account link
- [ ] `/kurzy` lists every published Course with cover, title, teaser, price and lesson count
- [ ] Order follows `sort` ascending, null last, `id` tiebreak; unit test covers null `sort` and the tiebreak
- [ ] Price formatter unit test covers Czech thousands spacing and the non-breaking space before „Kč"
- [ ] Empty state shows an explanatory message
- [ ] The Nitro route uses the session-derived client with anonymous fallback
- [ ] Verified anonymously in the running app: the fixture cover renders, page works at 375px
- [ ] `vp run check:all` passes
