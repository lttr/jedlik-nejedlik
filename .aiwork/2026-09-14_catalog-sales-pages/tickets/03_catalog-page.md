---
status: done
verified: [checks, behaviour]
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
  - "ADR 0004: ../../../docs/adr/0004-course-pages-read-through-nitro.md"
---

# 03 — Catalog at `/kurzy` with „Kurzy" in the main navigation

**What to build:** a visitor clicks „Kurzy" in the main navigation and sees every published Course as a card with cover, title, teaser, price in Czech formatting and lesson count, ordered by the Author's `sort` value. When nothing is published, an explanatory message replaces the list.

The page lives in the `shop` layer and fetches through a Nitro route that builds its Directus client from the caller's session, falling back to the anonymous server client (ADR 0004). The query filters explicitly on published status. Sorting is `sort` ascending, null last, `id` ascending as tiebreaker. Price is rendered by one shared formatter, the only place a price reaches the page. Only On-demand Courses appear; Live Courses stay on their marketing pages.

## Acceptance criteria

- [x] „Kurzy" appears in the main navigation, added the way area 02 added the account link
- [x] `/kurzy` lists every published Course with cover, title, teaser, price and lesson count
- [x] Order follows `sort` ascending, null last, `id` tiebreak; unit test covers null `sort` and the tiebreak
- [x] Price formatter unit test covers Czech thousands spacing and the non-breaking space before „Kč"
- [x] Empty state shows an explanatory message
- [x] The Nitro route uses the session-derived client with anonymous fallback
- [x] Verified anonymously in the running app: the fixture cover renders, page works at 375px
- [x] `vp run check:all` passes

## Evidence

Behaviour pass, anonymous headless Chromium against the dev server, 2026-09-14.

- Nav: `nav a` list in the DOM is O nás, Pro rodiče, Pro odborníky, **Kurzy → /kurzy**, Podcast, Kontakt; visible in `screenshots/03-kurzy-default.png` and `03-kurzy-375.png`.
- `GET /api/courses` anonymously: one item, `test-kurz-publikovany`, `status: published`, `price_czk: 1490`, `lessonCount: 6`, cover `749f89ba-…`; the draft fixture and the client's draft course are absent.
- Card: title, teaser, „1 490 Kč" (both spaces U+00A0 in the DOM) and „6 lekcí" (U+00A0), link `/kurzy/test-kurz-publikovany`; `03-kurzy-card-375.png`.
- Cover: an anonymous `curl` of the exact URL the card requests (`/assets/<id>?width=480&height=270`) returns 200 `image/png` 480×270. Chromium in this container cannot tunnel TLS through the agent proxy (every external host resets, `ERR_CONNECTION_RESET`), so for the visual pass the browser session was handed those same bytes for that URL; the `<img>` then reports `naturalWidth 480 × 270`. Verification-session transport only; no app code involved.
- Empty state: the `v-else-if` branch was temporarily forced locally (`>= 0`), screenshotted at both widths (`03-kurzy-empty-375.png`, `03-kurzy-empty-default.png`) and reverted before commit.
- 375×800: nav wraps to two rows, the card fills the width, nothing clips or scrolls horizontally.
- Unit tests: `tests/unit/catalog-order.test.ts` (null sort last, id tiebreak), `tests/unit/price.test.ts` (grouping, U+00A0), `tests/unit/lesson-count.test.ts`.
- Console: no errors from the app. Expected dev warning `No match found for location with path "/kurzy/test-kurz-publikovany"` until ticket 04 adds the route.
