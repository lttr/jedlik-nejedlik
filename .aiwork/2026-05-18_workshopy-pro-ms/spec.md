---
status: active
---

# Workshopy pro MŠ

## Original request

> Workshopy pro MŠ
>
> Jíme hravě – workshop za doprovodu rodičů nebo pedagogů
>
> Workshop je založen na vzájemné spolupráci mezi rodičem (případně
> pedagogem) a dítětem. V rámci programu si děti připraví jednoduché chutné
> pokrmy, zahrají si řadu aktivit zaměřených na podporu zdravého stravování a dobrého vztahu k jídlu.
> Aktivity podporují zvídavost dětí, otevřenou komunikaci o tom, co našemu tělu
> prospívá a prohlubují vzájemný vztah dítěte a dospělé osoby.
>
> Cena dohodou dle domluveného rozsahu.
>
> Jeníkova cesta za spokojeným bříškem – workshop pro děti
> Pohádkový workshop kombinuje vyprávění příběhu s praktickými aktivitami.
> Děti se seznámí s plyšovým kamarádem Jeníkem a snaží se zjistit, proč se Jeník
> necítí dobře a má smutné srdíčko.
> Společně pátrají po tom, co našemu tělíčku skutečně prospívá, skládají duhu z ovoce
> a zeleniny, seznámí se s výživovou pyramidou a starším dětem jsou
> představeny základní živiny.
> V závěru workshopu už je Jeník veselý a každý z dětí se tak stává "zeleninovým
> hrdinou". Na programu děti obdrží medaili, která rozhodně nebude z čokolády :) a svůj (možná) první úkolníček zdraví.
>
> Cena dohodou dle domluveného rozsahu.
>
> Ubrousku, prostři se – pro děti
> Program seznamuje děti s různými druhy potravin, podporuje rozvoj
> jejich smyslového vnímání potravin a dovednost mindfullness přístupu ke stravování. Na program navazuje společná hravá svačinka, kde
> mají děti rozvíjí své kompetence při přípravě jídla a pedagogové zkouší praxi tzv. pedagogického stravování.
>
> Cena dohodou dle domluveného rozsahu.

## Summary

Add a new section "Workshopy pro MŠ" to the existing `web/app/pages/pro-odborniky/skoly.vue`
page. Three workshop offerings aimed directly at children (some with parent/teacher
participation), each rendered as a `product-box` aside matching existing page conventions.

## Decisions

| Decision                             | Choice                                                                     | Rationale                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Target page                          | `pro-odborniky/skoly.vue`                                                  | Page title is "Mateřské a základní školy"; existing offerings already use `product-box` asides. `[DECIDED]`          |
| Section placement                    | After "Roční podpůrný program", before "Rodiče jako klíčová součást změny" | Groups school/child-facing offerings together, parent-facing after. `[DECIDED]`                                      |
| Section heading                      | `<h2 id="workshopy">Workshopy pro MŠ</h2>`                                 | Matches "Rodiče…" h2 pattern; boxes use h3. `[DECIDED]`                                                              |
| Price line                           | `<p>Cena dohodou dle domluveného rozsahu.</p>`                             | Mirrors "Roční program" price phrasing (plain `<p>`, no `<strong>Cena:</strong>` since no fixed number). `[DECIDED]` |
| Nav entries                          | Add 3 workshop links to both mobile-nav and sidebar-nav                    | Consistency with all other sections. `[DECIDED]`                                                                     |
| Typo in source ("mají děti rozvíjí") | Fix to "děti rozvíjí"                                                      | Grammatical slip in source text. `[DECIDED]`                                                                         |

## Scope

In:

- New `Workshopy pro MŠ` section with 3 `product-box` asides
- Nav links in mobile-nav + sidebar-nav

Out:

- New routes/pages, Directus content, pricing details

## Acceptance criteria

- skoly.vue renders new section with 3 workshop boxes
- Both navs link to the 3 new anchors
- Czech typography applied (nbsp, „" quotes, – dashes)
- `/verify` passes
