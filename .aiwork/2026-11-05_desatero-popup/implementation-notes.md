# Implementation notes — desatero pop-up

- **Logic is a pure util** (`web/app/utils/desatero-popup.ts`, unit-tested):
  skipped paths, the 14-day snooze, the „converted" cap and the season end
  (`OFFER_LAST_DAY = 2026-12-24`, Prague time). The component only wires
  timers, storage and the `<dialog>`.
- **`/kurzy/*` is skipped too**, not only `/objednavka/*`: course sales pages
  lead straight into checkout. Also skipped beyond the brief: the e-book page,
  `/pro-odborniky/*`, the privacy policy.
- **Timer runs while the cookie bar is open**, so the pop-up can appear right
  after the visitor decides. In dev the bar is hidden, so the pop-up shows
  without it; force the bar with „Nastavení cookies" in the footer to test.
- **Any close is a dismissal** (button, ×, Esc, backdrop, navigation to a
  skipped route via back button). The record is written on the dialog's
  `close` event, which fires a task after `close()`.
- **Reset for testing:** `localStorage.removeItem("desatero-popup")`.
- **No source tag** (user's call): see the spec for why and for the order
  of changes if it is ever needed.
