---
status: agent-done
verified: [checks, behaviour, ux]
references:
  - "Epic: ../2026-10-20_web-redesign/areas.md (area 02)"
  - "Target page: ../2026-11-05_ebook-landing/spec.md"
  - "Retires for now: ../2026-11-05_desatero-popup/spec.md (corner banner)"
---

# Spec: promo top bar (filled with the e-book)

## Goal

A generic promo bar („upoutávka") above the header on every page. It shows
whatever the current promotion is, or nothing when there is none. Right now
it is filled with the Christmas e-book promotion, pointing to
`/ebook-vanocni-cukrovi`. The menu link „Cukroví s dětmi" (the other half of
area 02) has already shipped in `MainNav.vue`.

Out of scope: the new navigation (06), the Directus-driven offer (08).

**Decided 2026-11-12 (user):** the bar is a general-purpose component, the
e-book is only its current content. The promotion ends by hand, not on a
date: when the e-book sale stops, the e-book page and the bar's content are
taken down together in one deploy. The bar is hidden on pages where it would
repeat what the page already says. The corner banner is switched off for
now: with the bar in place it is one promo too many.

## Shape

- **Component** `components/layout/PromoBar.vue`: knows nothing about the
  e-book. Props or a typed record: `id`, label (rich, the product name in
  bold), price, CTA text, target path, paths to hide on.
- **Current promo** as one hardcoded constant, `Promo | null`, next to the
  component. `null` means no bar is rendered. Ending a promotion = set it to
  `null` (or replace it with the next one). Area 08 later swaps this constant
  for a Directus record without touching the component.
- The e-book record takes `PRICE` (`components/ebook-cukrovi/content.ts`) and
  `EBOOK_PATH` (`components/home/content.ts`). Check imports with
  `fallow guard`. No `isInSeason`, no end date anywhere.

## Content (current promo)

**Changed 2026-11-12 (user):** look and copy follow the homepage prototype
artifact, not the brick-red strip of the first version.

> • Novinka na Vánoce: e-book **Cukroví s dětmi a v pohodě** · 290 Kč
> <u>Chci vědět víc →</u> ×

- Czech typography per `writing:czech-typography` (`290&nbsp;Kč`,
  `s&nbsp;dětmi a&nbsp;v&nbsp;pohodě`).
- Only the CTA is the link (bold, underlined); a star-yellow dot leads the
  line (hidden at 375 px); a small close button (`bi:x-lg`,
  `aria-label="Zavřít"`) follows the CTA.
- The promo sits on the left of a full-width midnight (`--color-midnight`)
  strip that also carries the social links on the right. The strip stays
  when there is no promo (homepage, dismissed, `null`), with the social
  links only. At 375 px the promo wraps to two lines above the social links.

## Behaviour

- **Where.** Rendered inside `layout/Header.vue`'s top strip, so both
  layouts get it from one place. In normal flow, not fixed: it scrolls away
  with the header and never covers content.
- **Hidden on** (where it would duplicate the page): the homepage (its hero
  and the band below already offer the e-book), the e-book page, the
  desatero page, `/objednavka…`, `/dekujeme-…`.
- **Dismiss per session.** A session cookie (`useCookie`, no `maxAge`)
  `promo-bar-dismissed=<promo id>`. Keyed by id, so the next promotion shows
  again even to someone who closed this one. Read on the server, so the bar
  is server-rendered: no `ClientOnly`, no layout shift, no hydration
  mismatch. A UI-customisation session cookie set by the user's own click is
  exempt from consent; it does not go through the cookie bar.
- Clicking the link does not dismiss.

## Corner banner off

- Unmount `<EbookBanner />` from `app.vue`. Fallow fails on unused files, so
  delete `EbookBanner.vue`, `utils/ebook-banner.ts` and their tests rather
  than leave them orphaned; git history keeps them. Leave the visitors'
  `ebook-banner` localStorage key alone (harmless).
- Mark the desatero-popup spec `abandoned` with a note pointing here. Keep
  `EbookCover.vue` if the e-book page still uses it.

## Coexistence with the cookie bar

The consent bar is fixed at the bottom, the promo bar in flow at the top: no
overlap, no z-index contest. Verify at 375 px that both fit on first load.

## Verify

- `vp run check:all`.
- `verify` skill at 1440 px and 375 px: bar visible on an article page and
  `/pro-rodice`, absent on `/`, the e-book and desatero pages; link navigates; close hides
  it, stays hidden across navigation and reload, returns in a fresh browser
  context; first load at 375 px with the cookie bar open: both readable,
  nothing covered; corner banner no longer appears after 30 s.
- With the current promo set to `null` locally: no bar, no empty strip.
