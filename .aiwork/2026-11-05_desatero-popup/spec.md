---
status: in-progress
verified: [checks, behaviour, ux]
references:
  - "Epic: ../2026-10-20_web-redesign/areas.md (area 04)"
  - "Sign-up page: ../2026-11-05_ebook-landing/implementation-notes.md (desatero)"
---

# Spec — Desatero pop-up

## Goal

A pop-up that sends visitors to `/cukrovickove-desatero`, the newsletter
sign-up that hands out the free „Cukrovíčkové desatero". It must not annoy:
one showing, then a long pause.

## Behaviour

- **Trigger.** Opens after 30 s on the site in this tab, or sooner after 15 s
  without interaction. The clock keeps running across client-side
  navigation; a full reload restarts it.
- **Content.** Heading, one sentence, a CTA link to `/cukrovickove-desatero`
  and a „Teď ne" button. No form inside: the sign-up page already has one,
  and a link keeps the pop-up light at 375 px.
- **Frequency cap** (localStorage `desatero-popup`):
  - closed (button, Esc, backdrop) → not again for 14 days;
  - CTA clicked, or `/cukrovickove-desatero` visited by any route → never again.
- **Season.** Offered until 24. 12. 2026 inclusive; the desatero is about
  Christmas baking. Area 08 will move this to Directus.
- **Skipped routes** (pop-up neither opens nor stays open there):
  checkout and shop (`/objednavka/*`, `/kurzy/*`, `/muj-ucet`), auth
  (`/prihlaseni`, `/registrace`, `/obnova-hesla`, `/overeni-emailu`), the
  sign-up funnel itself (`/cukrovickove-desatero`, `/dekujeme-*`), the e-book
  page (it has its own „Ještě váháte?" box and the visitor is about to buy),
  `/pro-odborniky/*` (not parents) and the privacy policy (the cookie bar
  links to it).
- **Cookie bar.** Never shown while the bar asks for a decision; the timer
  still runs, so the pop-up may follow right after the visitor decides.
- **Rendering.** Client-only, mounted next to the cookie bar in `app.vue`.
  Native `<dialog>` with `showModal()`: top layer (no z-index war), focus
  trap and Esc for free. At 375 px it fits without scrolling.

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
