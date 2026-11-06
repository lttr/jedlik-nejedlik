---
status: done
verified: [checks, behaviour]
references:
  - "Epic: ../2026-10-20_web-redesign/areas.md (area 05)"
  - "Prototype copy: ../2026-10-20_web-redesign/docs/prototype-homepage.txt"
  - "Prototype source (not committed): /tmp/jedlik-nejedlik-prototypes/prototype-homepage.source.html, prototype-homepage-assets/"
  - "Sibling: ../2026-11-05_ebook-landing/spec.md (components to reuse: web/app/components/ebook-cukrovi/)"
  - "Current page: web/app/pages/(homepage)/index.vue (one section, AboutProjectSection)"
---

# Spec — Homepage

## Goal

Every social post and podcast mention sends people to `/`, and today it
shows one block („Výživa a výchova v propojení"). Rebuild it so a visitor
sees in one screen who we are and what is new, why to trust us, and then
forks into the problem they have or the offer they want.

## Decisions (inherited from the epic, 2026-11-05)

- **Prototype is a guide, not a port.** Section order and layout follow it;
  our stack, styles, palette and components.
- **Specific first.** Hardcode what only the homepage uses; extract a
  component from `ebook-cukrovi/` only when the homepage needs the same
  thing (media strip, reviews). No Directus-driven offer (area 08).
- **Missing assets do not block.** A section waiting for an asset does not
  render.
- **Content in code.**

## Out of scope (other areas)

- Top bar („Novinka na Vánoce…") — area 02, built in parallel.
- New navigation and footer from the prototype — area 06.
- Desatero pop-up — area 04, built in parallel.
- Offers hub page („Celá nabídka" target) — area 07.
- Topic pages behind the problem router — area 10; the router links to the
  current `/nejedlik`, `/nadvaha`, `/prevence`.

## Sections, in prototype order

| #   | Section                                                                                                                                                                                            | Source / note                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Hero: kicker „Výživa a výchova v propojení", H1 „Aby jídlo doma nebylo bojem.", lead, CTAs „S čím potřebujete pomoct?" (anchor to 4) and „E-book Cukroví s dětmi", Zdeňka's photo with name + role | prototype; photo: existing Directus portrait until 00 delivers a new one               |
| 2   | „Znáte nás z" media strip (ČT24, iDNES, Český rozhlas, Deník N)                                                                                                                                    | reuse the e-book landing's strip; links from `MediaSection.vue` (o-nas) — see Q3       |
| 3   | Current offer band: e-book, 290 Kč, „PDF hned do e-mailu", CTA → `/ebook-vanocni-cukrovi` (fires nothing; tracking is on the landing)                                                              | prototype; hardcoded, swapped by hand after Christmas until area 08                    |
| 4   | „S čím potřebujete pomoct?" 3 cards → `/nejedlik`, `/nadvaha`, `/prevence`                                                                                                                         | prototype copy                                                                         |
| 5   | „Aktuální nabídka" 4 cards: e-book, online course, webinar Generace alfa, consultation; „Celá nabídka" link                                                                                        | prototype; prices from the live pages — see Q1, Q2                                     |
| 6   | „Co o nás říkají lékaři a rodiče": doctor + 2 parents                                                                                                                                              | the e-book reviews (`ebook-cukrovi/content.ts`), shortened; no numbers (none exist)    |
| 7   | „Víme, jaké to je" about block + 3 facts, CTA „Více o nás a týmu" → `/o-nas`                                                                                                                       | prototype copy; claims confirmed with Zdeňka like the e-book's                         |
| 8   | Podcast: blurb + „Poslouchat na Spotify"                                                                                                                                                           | prototype; no „Bonusy pro předplatitele" (epic non-goal); link, no embed (consent)     |
| 9   | Newsletter + desatero: name + e-mail form, gift line                                                                                                                                               | reuse the `/cukrovickove-desatero` form (newsletter sign-up → thank-you page with PDF) |

## Open questions

- **Q1 — „Celá nabídka" target before area 07 exists.** Default: link to
  `/kurzy` (shop catalog) and switch to the hub when 07 ships. Alternative:
  hide the link until then.
- **Q2 — Offer card prices.** Online course: prototype says `[cena]` and
  `/2026-online-kurz-deti` shows no price; default: card without a price.
  Consultation:
  prototype says „od 1 500 Kč", `/konzultace-deti-obezita` lists
  250–1 000 Kč. Default: the live page wins, „od 250 Kč".
- **Q3 — Media strip links.** Default: link each outlet to its article from
  `MediaSection.vue`; outlets without a link stay plain text.
- **Q4 — Old homepage components.** `homepage/` holds 10 components no page
  uses (AboutUs, Experts, Lectures, Testimonials, …). Default: delete them
  in this area, keep `ContactsCard` and `LectureCard` (used by `style.vue`).
- **Q5 — Branch.** Areas 02 and 04 run in parallel worktrees. Default: this
  area works on a local branch `homepage` and ships by rebase onto
  `master`.

## Verification

- `vp run check:all` green.
- `verify` skill on `/`, desktop and 375 px: every section renders, every
  CTA and card reaches its target, the newsletter form lands on the
  thank-you page.
- Lighthouse on `/` not worse than today.
- Czech copy through `writing:czech-typography`.
