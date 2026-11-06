# Implementation notes — e-book corner banner

- **Replaced the desatero modal** on the user's call (too distracting) with
  `EbookBanner.vue`: a fixed `<aside>`, not a `<dialog>`.
- **Logic is a pure util** (`web/app/utils/ebook-banner.ts`, unit-tested):
  skipped paths, the 14-day snooze, the „converted" cap and the season end
  (`OFFER_LAST_DAY = 2026-12-24`, Prague time).
- **Cover reuses `EbookCover small`** at its designed 10.5rem width and
  shrinks it with `zoom`, so its type keeps its proportions. The banner's own
  class must not be `.cover`: scoped styles reach the child's root element,
  which has that class, and the zoom applied twice.
- **`/` is skipped**: the homepage has the e-book band right under the hero.
- **In dev the cookie bar is hidden**, so the banner shows without it; force
  the bar with „Nastavení cookies" in the footer to test.
- **Reset for testing:** `localStorage.removeItem("ebook-banner")`.
- **No source tag** (user's call): see the spec.
