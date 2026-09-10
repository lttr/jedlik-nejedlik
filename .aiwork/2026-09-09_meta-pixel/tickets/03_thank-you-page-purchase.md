---
status: done
verified: [checks, behaviour, review]
blocked_by: [02]
references:
  - "Spec: ../spec.md"
  - https://podpora.redbit.cz/navod/nastaveni-trekovacich-a-konverznich-nastroju/
---

# 03 — Thank-you page fires Purchase after payment, handoff to owner and marketer

**What to build:** After paying on SimpleShop, a Live Course buyer lands on a thank-you page on our own domain (naming shape of the existing newsletter thank-you page) that confirms the payment with course-specific copy (heading, start date) and says the confirmation and doklad arrive by e-mail. For a consenting visitor, `Purchase` fires once per session with the Live Course id; a refresh does not double-count, and a visitor who refused sends nothing. One page, three URLs differing only by a static `kurz` query parameter read against the Live Course table; unknown or missing `kurz` shows generic copy and a `Purchase` with no id, never an error. The page is `noindex` and unlinked from navigation.

The ticket also closes the loop outside the code: the three "URL po uhrazení" values for the site owner to paste into SimpleShop, the marketer note, and the epic index entry.

## Acceptance criteria

- [x] Page shows correct copy for each of the three `kurz` values and generic copy for an unknown or missing one; e-mail delivery of confirmation and doklad stated in every variant
- [x] With consent, `Purchase` fires with the Live Course id exactly once per session; reload fires nothing more; without consent nothing reaches Meta
- [x] `noindex`, not present in any navigation or footer
- [x] E-book and webinar post-purchase flow unchanged (they keep SimpleShop's own page)
- [x] Handoff recorded in `implementation-notes.md`: the three redirect URLs for SimpleShop's per-product "URL po uhrazení", and the site owner's decision on the first `Purchase` (refunded test order vs real buyer)
- [x] Note to the marketer drafted: pasted snippet fails (curly quotes), `content_type: 'kurz'` invalid, `Purchase` now means completed payment, `InitiateCheckout` is the click, only consenting visitors are measured, verify in Events Manager
- [x] E-shop epic's `../2026-06-09_kurzy-platforma/areas.md` records that cookie consent was built in this task
- [x] `vp run check:all` passes; `verify` skill run on the four `kurz` variants at 375px and desktop
