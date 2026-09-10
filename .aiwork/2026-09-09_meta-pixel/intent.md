---
status: accepted
references:
  - "Pixel ID: 3144448269086284 (client e-mail, 2026-09)"
  - https://scripts.nuxt.com/scripts/tracking/meta-pixel
---

# Meta Pixel: intent

The client asked us to add a Meta Pixel and fire a `Purchase` event on the buy
buttons. On this site that is more than a snippet paste, and nothing is decided
yet.

## Why

**Consent.** The site has no cookie banner because Plausible is cookieless. The
pixel sets cookies and needs opt-in, so this adds the site's first consent
banner and a rewrite of the privacy policy, which promises cookieless
measurement today.

**Split checkout.** Every buy button sends the visitor to SimpleShop, where the
purchase happens. A click is the start of a checkout, not a sale. Firing
`Purchase` there would inflate conversions and mislead ad optimisation.

## Leaning

Small site, few products, so keep it proportionate: load the pixel via Nuxt
Scripts, gate it behind our own small consent banner, fire `InitiateCheckout` on
the buttons. Skip the Conversions API until there is real ad spend. It is not a
way around consent either: hashed e-mails are still personal data.

## Open questions

Site owner:

1. Is a cookie banner acceptable? The pixel then sees only visitors who accept.
2. Can we get Meta Events Manager access, or will someone with it do the setup?
3. Does the SimpleShop plan allow custom HTML on the thank-you page? That
   decides whether a real `Purchase` is measurable at all.

Whoever runs the ads:

4. Are ads running now, or is the pixel only building history?
5. Does the campaign setup depend on the event being named `Purchase`?
6. Is there already a pixel on the SimpleShop side? Two pixels across a split
   checkout double-count.

Tell both now that this includes a consent banner and a privacy-policy change.
