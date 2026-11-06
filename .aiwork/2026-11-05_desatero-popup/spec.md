---
status: done
verified: [checks, behaviour, ux]
references:
  - "Epic: ../2026-10-20_web-redesign/areas.md (area 04)"
  - "Sign-up page: ../2026-11-05_ebook-landing/implementation-notes.md (desatero)"
---

# Spec — E-book corner banner (was: desatero pop-up)

## Goal

A quiet nudge towards `/ebook-vanocni-cukrovi` on the rest of the site.

**Changed 2026-11-06 (user):** the first version was a full-page modal for
the desatero; „too distracting". Now it is a non-modal banner in the
bottom-right corner about the e-book. The desatero stays reachable from the
e-book page's „Ještě váháte?" box.

## Behaviour

- **Trigger.** Slides in after 30 s on the site in this tab, or sooner after
  15 s without interaction. The clock keeps running across client-side
  navigation; a full reload restarts it.
- **Content** (layout from the user's mockup, offer flipped to the e-book):
  small e-book cover, „Chystáte se na Vánoce s dětmi?", one line with the
  price, a brick-red „Chci e-book" button, a secondary „Desatero zdarma →"
  link and a close button in a peach circle. No backdrop, no focus steal.
- **Frequency cap** (localStorage `ebook-banner`):
  - closed → not again for 14 days;
  - either link clicked, or the e-book or desatero page visited by any
    route → never again.
- **Season.** Offered until 24. 12. 2026 inclusive.
- **Skipped routes:** `/` (the e-book band sits right under the hero), the
  e-book page, `/cukrovickove-desatero` and `/dekujeme-*`, checkout and shop
  (`/objednavka/*`, `/kurzy/*`, `/muj-ucet`), auth (`/prihlaseni`,
  `/registrace`, `/obnova-hesla`, `/overeni-emailu`), `/pro-odborniky/*` and
  the privacy policy.
- **Cookie bar.** Never shown while the bar asks for a decision; it shares
  the bottom edge.
- **375 px.** Full width minus margins, price line hidden, about 170 px tall.

## Source tagging (decided: not now)

Sign-ups are not tagged by source: the Directus flow „Vyplněn formulář
Newsletter pro rodiče" sends every `newsletter_parents_form` item to Ecomail
list 1 with the fixed tag `jedlik-nejedlik-parents` and a fixed
`CONTACT_SOURCE` (`update_existing: false`).

**User's call 2026-11-05: no tag for now.** Nobody plans a follow-up e-mail
to desatero sign-ups, and pop-up conversion can be measured in Plausible
without a schema change. If a targeted e-mail comes up later: add a nullable
`source` field plus its public create permission, then the flow tag, and only
then send it from the site (the reverse order breaks every sign-up).

## Verify

- Unit tests for the pure decision (route, cap, season).
- Running app: opens after the delay on `/`, not on `/prihlaseni` or
  `/objednavka/*`, not while the cookie bar is open; „Teď ne" sets the cap and
  a reload does not reopen it; CTA lands on the sign-up page; 375 px
  screenshot.
