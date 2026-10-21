---
status: not-started
references:
  - "intent.md (this folder)"
  - "Meta Pixel + consent: ../2026-09-09_meta-pixel/spec.md"
  - "Catalog + sales pages: ../2026-09-14_catalog-sales-pages/spec.md"
  - "Checkout + GoPay: ../2026-09-15_checkout-gopay/spec.md"
---

# Spec — Web redesign (epic)

Framing only. Each area in [areas.md](areas.md) gets its own spec when it
starts.

## Problem Statement

All traffic (social posts, podcast mentions, word of mouth) lands on the
homepage, and the homepage does not convert it. It presents one block
(„Výživa a výchova v propojení"),
no face, no list of services or products, no proof that anyone trusts the
association, and no current offer.

Below the homepage, the information architecture is organised by audience
(„Pro rodiče", „Pro odborníky") rather than by the parent's problem or by
what the association sells. A parent who came for the Christmas e-book has
to guess where it lives. Topic pages (`nejedlik`, `nadvaha`, `prevence`)
are long expert texts written for completeness, not for a tired parent who
needs to recognise their situation and click.

Product pages explain but do not sell: no price-and-bullets summary at the
top, no social proof, no bonus, no free taster that would collect a
contact.

Nothing on the site collects contacts except the newsletter form, and the
paid-ad funnel for the e-book ends at the click on the buy button.

## Solution

Rebuild the marketing surface around three ideas, taken from the prototype:

1. **One featured offer, visible everywhere.** A single, time-boxed
   „aktuální nabídka" (now the e-book Cukroví s dětmi v pohodě, later a
   webinar, course or consultation) drives the top notification bar, the
   highlighted nav button, the homepage band and the lead-magnet pop-up.
   Swapping the season's offer is an edit in Directus, not a deploy.
2. **Navigation by problem and by product.** „Pro rodiče" opens a menu of
   three situations: Moje dítě nejí, Moje dítě má nadváhu, Prevence.
   „Kurzy a e-booky" lists everything for sale or free in one place.
   Podcast, O nás, Kontakt stay; „Pro odborníky" moves to the top bar.
3. **Pages that persuade.** A homepage with a face (Zdeňka) in the hero,
   media logos, a problem router, the offer grid, testimonials with
   numbers, the team, newsletter and podcast. A reusable product landing
   template (first used for the e-book) with hero + price, media,
   „Znáte to?" pain points, „Co se u vás změní", a short video, contents,
   tips by age, reviews, what you get + bonus, FAQ, free taster.

Contacts are collected through a free „desatero" lead magnet (pop-up,
newsletter block, landing-page fallback CTA). The e-book funnel is
measured end to end in Meta, extending the pattern of the Meta Pixel area.

## Decisions to make before the first area

- **Adopt how much of the prototype.** The marketer offered "extract it and
  deploy" or "use it as a guide". Extraction is not literal: the site is
  Nuxt with layers, Directus content, our styles and components. The
  prototype is a visual and structural reference; we re-implement. Confirm
  with the client that this is the reading they want.
- **Visual language.** The prototype keeps the current palette and type
  (peach header, navy, lime, burgundy, the logo) and adds new section
  styles. Decide whether the area work also refreshes the design tokens or
  only adds components.
- **E-book checkout.** The e-book sells through SimpleShop today
  (`ebook-vanocni-cukrovi.vue`, product `gN5Qq`; shown „Vyprodáno" in the
  video). The on-site checkout (GoPay, area 04 of `kurzy-platforma`) sells
  On-demand Courses only. Decide whether the e-book stays on SimpleShop for
  this season (then area 08 extends the thank-you-page `Purchase` pattern)
  or moves to our checkout as a new product type (then it joins the shop
  layer and the funnel is ours).
- **Pixel inside SimpleShop.** The marketer wants the pixel in SimpleShop's
  form. The Meta Pixel spec chose a thank-you redirect on our domain instead
  and recorded why (consent, no custom HTML on SimpleShop's post-payment
  page). Area 08 revisits this with the marketer; the default stays the
  existing pattern.
- **Who supplies content.** Most areas block on assets only the client has:
  photos, the video, testimonials with permission, media links, the
  desatero PDF, review counts. See area 00.

## Non-goals

- The LMS, course player and checkout internals (epic `kurzy-platforma`).
- A paid podcast tier („Bonusy pro předplatitele" in the prototype): the
  marketer said it is undecided. Leave a slot, build nothing.
- Audio version of the e-book: mentioned as future, depends on Zdeňka.
- Pages for professionals (`pro-odborniky/*`) beyond moving the nav link.
- Rewriting topic pages with AI without the authors' review; any copy
  change goes through the client.

## Sources

- `intent.md` — key points of the marketer's narration.
- The video and the two prototype artifacts linked in `intent.md`. The
  artifacts need a claude.ai login (403 when fetched on 2026-10-20).
