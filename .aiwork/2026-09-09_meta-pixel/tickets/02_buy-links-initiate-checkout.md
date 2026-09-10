---
status: ready
blocked_by: [01]
references:
  - "Spec: ../spec.md"
---

# 02 — Live Course buy buttons go to SimpleShop and fire InitiateCheckout

**What to build:** Clicking a buy button on any of the three actively sold Live Courses (online 3–7 let, naživo 2.–5. třída HK, naživo 6.–9. třída HK) opens the course's SimpleShop product and, for a consenting visitor, fires `InitiateCheckout` carrying the Live Course id as content name. The two in-person courses stop pointing at the Google Form and their questionnaire step disappears (reverses `5af4992`, confirmed by the site owner). The webinar and e-book buy buttons are untouched and fire nothing.

The three Live Course rows (SimpleShop URL, `kurz` id, display name, start date) live in one plain constant module under the app's utils, per the spec table. One buy-link component owns both the anchor and the event and replaces the hardcoded anchors on the three surfaces, keeping their classes, `target="_blank"` and `rel="noopener"`.

## Acceptance criteria

- [ ] Live Course table exists with the three rows and ids from the spec (`online-3-7-2027-01` / `yXRL9`, `nazivo-2-5-hk-2026-10` / `JmEVq`, `nazivo-6-9-hk-2026-09` / `RYlVD`); not in the `shop` layer, not in Directus
- [ ] Both in-person course pages send buyers to their SimpleShop product; no Google Form link or questionnaire copy remains
- [ ] All Live Course buy buttons render through the buy-link component with unchanged look, `target` and `rel`
- [ ] With consent accepted, a click fires `InitiateCheckout` with the Live Course id as content name; without consent or after refusal, no request reaches Meta
- [ ] No `value`, `currency`, price or `Lead` events; webinar and e-book unchanged
- [ ] `vp run check:all` passes; `verify` skill run on the three course pages
