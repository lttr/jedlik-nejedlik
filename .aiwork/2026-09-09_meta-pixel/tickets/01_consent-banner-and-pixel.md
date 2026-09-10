---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
  - https://scripts.nuxt.com/scripts/tracking/meta-pixel
---

# 01 — Consent banner gates the Meta Pixel, privacy policy matches

**What to build:** A first-time visitor sees a small bottom bar with **Přijmout** / **Odmítnout** and a link to the privacy policy. Until they accept, no request of any kind reaches Meta, not even the script itself. After either choice the bar is gone across pages and visits with no flash on return. The decision can be changed later from the footer's legal links and from the privacy policy's cookies section, which is rewritten to describe what the site actually does. Plausible stays untouched and ungated.

Pixel loads through `@nuxt/scripts` (new to the project) with the Meta Pixel registry script, gated by the consent trigger, production-only next to the existing Plausible block, pixel ID hardcoded in the Nuxt config. Own component and composable, no CMP; decision stored in `localStorage` as `{ status, decidedAt, version }`, bar rendered client-only.

## Acceptance criteria

- [ ] Before any decision and after **Odmítnout**, the network tab shows no request to any Meta host; after **Přijmout**, pixel requests appear
- [ ] Bar shows on first visit, disappears after either choice, stays gone across navigation and after reload, with no hydration mismatch or flash when a decision is stored
- [ ] Both buttons equally weighted, short text, link to the privacy policy; readable and tappable at 375px without blocking content
- [ ] Bar is mounted once and covers both layouts (default and homepage)
- [ ] Footer legal links carry a control that reopens the bar; the privacy policy's cookies section carries the same control; a changed decision takes effect on the next page load
- [ ] Pixel loads only in production (mirrors Plausible); dev and the test hostname load nothing
- [ ] Plausible behaviour unchanged
- [ ] Privacy policy cookies section: legitimate-interest cookie claim corrected (measurement is cookieless), Meta Platforms Ireland named as ad-targeting recipient with purpose and link to Meta's privacy policy, sentence on transfers outside the EU, how to withdraw consent
- [ ] `vp run check:all` passes; `verify` skill run on the banner flow and the policy page
