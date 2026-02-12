---
status: active
---

# Nejedlíci page - spec

## Summary

Replace stub `/nejedlik` page with full content about picky eaters. Add newsletter signup form at the bottom that incentivizes with a free PDF checklist download (Directus asset `a50cceb7-1ca5-4f16-bcdf-10515cae0ff7`). Same pattern as the previous Christmas cookies desatero.

## Original spec

> ## **Moje dítě „nejí"**
>
> **Nezoufejte. Nejste v tom sami.**
>
> - Je pro vás jídlo vašeho dítěte každodenním zdrojem stresu?
> - Odmítá nové potraviny, konzumuje velmi omezený repertoár, stolování je každodenní boj, pláč a vztek je běžnou součástí stolování nebo se dítě jídlu úplně vyhýbá?
> - Potíže s jídlem mají u dětí mnoho podob i příčin – vývojových, fyziologický, smyslových, emočních, vztahových a dalších.
>
> U nás nehledáme, kdo co zkazil, ale jak se v dané situaci posunout k funkčnějšímu stravování a větší pohodě u stolu.
>
> ## **Kdy se na nás rodiče obracejí nejčastěji**
>
> - Máte doma tzv. nejedlíka nebo velmi vybíravé dítě
> - Trápí vás chování dítěte u jídla (odmítání, pláč, vyjednávání, boj)
> - Období příkrmů neprobíhá podle vašich představ
> - Máte obavy, že vztah k jídlu se nevyvíjí pohodově
> - Nejste si jistí ohledně výživy vašeho dítěte a potřebujete ujištění
> - Už je toho na vás okolo stravování moc, je to pro vás zdroj frustrace
> - Potřebujete se v situaci zorientovat a získat nadhled
> - Dítě se potýká se zácpou
> - Dítě má za sebou lázeňský pobyt nebo jiný zásah do stravování a nevíte, jak dál
>
> ## **Společně zpět k pohodě u stolu**
>
> Ať už je vaše situace jakákoliv, **nemusíte na ni být sami**.
>
> U nás víme, že jídlo je naučená dovednost a návyky okolo stravování se vytváří mnoho let. Cílem není, aby dítě jedlo všechno a hned ani abyste s námi trávili roky a byli na nás závislí.
>
> **Pomůžeme vám najít důvěru v to, že můžete nakrmit své dítě, posílit vaše rodičovské kompetence okolo stravování, snížit napětí u jídla a nastavit dlouhodobě udržitelný směr.**
>
> ## **Jak pracujeme**
>
> V Jedlíkovi-Nejedlíkovi věříme, že:
>
> - jídlo je dovednost, která se vyvíjí v čase,
> - nátlakové metody ničí u dítěte vztah k jídlu,
> - každá situace má řešení.
>
> **Pracujeme vždy s respektem k dítěti i k realitě rodiny. Hledáme řešení na míru právě pro vás, které je srozumitelné, žitelné a dlouhodobě udržitelné.**
>
> ## **Co od nás můžete očekávat**
>
> Výživa dětí je naším srdcovým tématem.
> Během konzultací propojujeme:
>
> - **výživu**,
> - **výchovné principy**,
> - **emoční a vztahovou rovinu.**
>
> Inspirujeme rodiče k vytváření prostředí, kde se může dítě v jídle bezpečně posouvat, a budovat si tak zdravý vztah k jídlu i sobě na celý život.
>
> ## **Jak konzultace probíhá**
>
> Nejdříve potřebujeme porozumět vaší konkrétní situaci.
>
> ### **Úvodní konzultace**
>
> **1500 Kč / 70 minut**
>
> Zahrnuje:
>
> - vyhodnocení vstupního anamnestického dotazníku a jídelníčku
> - rozbor videa stolování
> - návrh prvních konkrétních kroků pro domácí prostředí
>
> Následně navrhujeme další postup. Co to znamená v praxi?
>
> - Všechno potřebné víte a žádná další konzultace není potřeba.
> - Domlouváme si plán dalších návštěv.
> - Navrhujeme práci v multioborovém týmu (nejčastěji ergoterapeut, logoped, psychoterapeut), který navazuje na naši práci z úvodní konzultace.
>
> **Následné konzultace**
>
> **500,-/hodina**
>
> Slouží k doladění, podpoře a úpravám podle vývoje situace.
>
> **Milí rodiče, některé obtížné situace okolo jídla jsou vývojově běžné, i přesto, že nám denně obtěžují život a znejišťují nás. Mnoho náročných situací dokážete zvládnou sami bez vnější podpory, jindy se potřebujeme o někoho opřít. Pokud si nejste jistí, zda vyhledat pomoc odborníka, zorientujte se ve vaší situaci s naším check listem.**
>
> KE STAŽENÍ ZDE

## Decisions

| Decision                      | Choice                                        | Rationale                                            |
| ----------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Page structure                | Follow `nadvaha.vue` pattern                  | Consistent sibling pages                             |
| Newsletter form customization | Props on NewsletterForm                       | Reusable, no duplication                             |
| PDF delivery                  | Query param on thank-you page                 | `?pdf=nejedlici-checklist` triggers download section |
| PDF asset ID                  | `a50cceb7-1ca5-4f16-bcdf-10515cae0ff7`        | Provided by user                                     |
| Form CTA text                 | "Stáhněte si náš check list zdarma" [DECIDED] | Matches spec "check list" language                   |

## Scope

**In:** nejedlik.vue content, NewsletterForm props, thank-you page PDF download
**Out:** New Directus collections, new images, e-book upsell

## Acceptance criteria

- `/nejedlik` shows all content from spec
- Newsletter form at bottom with checklist-specific copy
- After signup → redirect to thank-you page with PDF download link
- PDF downloads from Directus with `?download` param
- Existing newsletter form on `/pro-rodice` unchanged
