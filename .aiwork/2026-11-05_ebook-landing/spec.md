---
status: done
verified: [checks, behaviour, ux, review, human]
deadline: 2026-11-09
references:
  - "Epic: ../2026-10-20_web-redesign/areas.md (area 01)"
  - "Prototype source (not committed): /tmp/jedlik-nejedlik-prototypes/prototype-ebook.source.html (markup, CSS, FAQ data), prototype-ebook.html (original export, renders when served over http), prototype-ebook-assets/"
  - "Prototype copy: ../2026-10-20_web-redesign/docs/prototype-ebook.txt"
  - "Current page: web/app/pages/ebook-vanocni-cukrovi.vue (last year's copy, previews, testimonials)"
  - "Meta Pixel events: ../2026-09-09_meta-pixel/spec.md"
---

# Spec — E-book landing: Cukroví s dětmi a v pohodě

## Goal

Rewrite `/ebook-vanocni-cukrovi` (keep the URL, it is already shared) so a
parent arriving from an ad or a reel understands the offer in one screen and
gets persuaded below it. Live **Monday 9. 11. 2026**.

## Decisions (grill session 2026-11-05)

- **Specific, not generic.** Components local to this page (sibling
  folder or inline), no reusable landing template. Extraction is area 09,
  when a second product page exists.
- **Checkout stays SimpleShop** (`https://form.simpleshop.cz/gN5Qq/buy/`).
  Buy buttons keep firing `InitiateCheckout` through
  `$trackMetaPixelEvent`; the full funnel is area 03.
- **Structure from the prototype, copy merged.** Section order and layout
  follow the prototype. Last year's copy is the base where both cover the
  same thing (it is approved and it sold); the prototype adds sections and
  sharper headlines. Use judgment per section, adapted to our styles,
  components and palette, not a port of the prototype's React/CSS.
- **Content in code**, as last year. Nothing new in Directus.
- **Missing assets do not block launch.** A section whose asset is
  missing does not render; adding it later is one path/id change.
- **Claims go in as written** and are confirmed with Zdeňka after
  launch; whatever she rejects is corrected or removed then (list below).
  Keep each claim easy to find and edit in the page source.

## Sections, in prototype order

| #   | Section                                                                                                                                                                                           | Source / note                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Hero: kicker, headline „Vánoce bez bitev o cukroví. I u babičky.", lead, CTA „Chci e-book za 290 Kč", „PDF hned do e-mailu · čtení v mobilu i tisk", doctor's one-line quote, cover with 3 badges | prototype; cover image from the current page                                                |
| 2   | „Autorku znáte z" media strip (ČT24, iDNES.cz, Český rozhlas, Deník N)                                                                                                                            | prototype; text logos are fine, links later (00)                                            |
| 3   | „Znáte to?" 5 pain points + closing line                                                                                                                                                          | prototype; icons, no AI illustrations for now                                               |
| 4   | Video from Zdeňka                                                                                                                                                                                 | **asset missing → not rendered**                                                            |
| 5   | „Co se u vás změní" 3 outcomes                                                                                                                                                                    | prototype, merge with last year's „Co vám přinese?"                                         |
| 6   | „Co v e-booku najdete" 8 tools                                                                                                                                                                    | prototype, check against last year's „Co uvnitř najdete"                                    |
| 7   | „Tipy podle věku" tabs (do 1 roku / 1,5–2 / od 2,5 / od 4)                                                                                                                                        | prototype; accessible tabs, works at 375 px                                                 |
| 8   | „Nahlédněte dovnitř"                                                                                                                                                                              | last year's 3 Directus preview images + lightbox; prototype intro copy                      |
| 9   | Reviews: doctor (long) + 3 parents                                                                                                                                                                | last year's full texts and photos; prototype pull-quotes as headings; no „new reviews" slot |
| 10  | „Kdo e-book napsal" Zdeňka medallion + 3 roles                                                                                                                                                    | prototype bio; last year's photo until the final one arrives                                |
| 11  | Pricing: 290 Kč, „Co přesně dostanete", Mikuláš bonus, gifting line, CTA                                                                                                                          | prototype                                                                                   |
| 12  | FAQ (7)                                                                                                                                                                                           | prototype `faqData` in the source; merge with last year's 5 answers                         |
| 13  | Final CTA „Ať jsou letošní Vánoce hlavně o pohodě."                                                                                                                                               | prototype                                                                                   |
| 14  | „Ještě váháte? Desatero zdarma"                                                                                                                                                                   | **rendered** (review): newsletter sign-up at `/cukrovickove-desatero`, last year's PDF      |

Plus: a sticky mobile buy button once the hero CTA scrolls out of view.

Dropped from last year unless the merge finds them worth keeping: „Pro koho
je" (covered by tips by age + FAQ), „Co v e-booku nenajdete?" (FAQ
„recepty" covers it).

Out of scope for this spec: the top bar and menu link (area 02, ship
alongside if time allows), the prototype's header/footer/nav (06).

## Claims to confirm with Zdeňka (after launch)

- „61 stran" (last year's page says?) and the three cover badges
- Mikuláš bonus: buy by 6. 12., live Q&A on 9. 12.
- Gifting: „při objednávce zadejte e-mail obdarovaného" (verify in
  SimpleShop)
- „Budoucí aktualizace zdarma"
- Tisknutelné listy: plán mlsání, checklist před návštěvou, věty pro
  babičku; „Rychlý start na 2 strany"
- The 8 named tools and the age tips match the PDF
- Bio wording: „Od dětství bojovala s vlastní obezitou", „Metodička
  dětské sekce STOB"
- Media list (ČT24, iDNES.cz, Český rozhlas, Deník N)

## Assets to add later (00)

Video (section 4), final author photo (10), desatero PDF (14), new PDF
preview pages if they differ from last year's (8).

## Acceptance

- [x] All sections above render at 1440 and 375 px; section 4
      absent, no placeholder text anywhere.
- [x] Every buy button opens SimpleShop `gN5Qq` and fires
      `InitiateCheckout` once.
- [x] Czech copy through `writing:czech-typography`.
- [x] Tabs and FAQ keyboard-operable.
- [x] `vp run check:all` green; `verify` skill passed.
