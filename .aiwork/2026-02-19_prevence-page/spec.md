---
status: active
---

# Prevence page - full content build-out

## Original text

> **Nečekejte s péčí o zdraví svých dětí až bude problém, pojďte cestou prevence... vyplatí se to vám i vašim dětem.**
>
> Většina dětí se rodí zdravá. To, jak se bude jejich zdraví vyvíjet dál, ovlivňuje největším dílem každodenní realita:
>
> rodinné návyky
>
> způsob komunikace o jídle
>
> režim dne
>
> výživa, pohyb, spánek, vztahy...
>
> Prevence neznamená dietu ani dělení potravin na zdravé a nezdravé, hlídání každého sousta nebo odepírání si všech dobrot světa a bičování se k velkým výkonům apod.
>
> Umožněte vašemu dítěti vstoupit do dospělosti:
>
> - v plném zdraví, v síle, odolnosti a funkčnosti
> - s předpokladem, že si zdraví udrží do vysokého věku
> - se zdravým vztahem k jídlu i k sobě samému
> - s vědomím si toho, kým je a že jeho hodnota není o jeho hmotnosti, výkonu ani vzhledu.
>
> Prevence znamená vytvářet konstantně prostředí, ve kterém má dítě šanci vyrůst ve zdravého člověka, a to jak po fyzické, tak psychické stránce.
>
> V Jedlíkovi-nejedlíkovi věříme, že prevence je nejlepší způsob, jak zachovat zdraví našich dětí, jak pečovat o dar, který většina z nich dostala při svém narozením.
>
> Proto:
>
> - **šíříme** na našich sociálních sítích **zdarma relevantní informace** k tématu
> - **vytváříme online produkty** z roviny zdravého životního stylu v rovině prevence, a to zdarma nebo za symbolické částky, které nezruinují vaši peněženku a zároveň podpoří činnost naší organizace
> - **vystupujeme** na přednáškách pro rodiče a širokou veřejnost i na odborných konferencích
> - **upozorňujeme na další smysluplné projekty** v oblasti prevence
> - **spolupracujeme** s podobně laděnými organizacemi a odborníky, v jejichž práci věříme jak po odborné, tak po lidské stránce
> - **vyvracíme** mýty v oblasti zdravého životního stylu.
>
> ### STÁHNĚTE SI ZDARMA
>
> SEM VLOŽIT KE STAŽENÍ ZA KONTAKT ZDRAVÉ SVAČINKY PRO MÉHO ŠKOLÁKA.
> A NĚJAKÝM MALÝM PÍSMEM TAM NAPSAT - MATERIÁL OD NAŠICH KOLEGŮ Z ORGANIZACE STOB, s. r. o.
>
> ### Potřebujete víc?
>
> Prevenci se věnujete, patříte mezi aktivní rodiče, ale dlouhodobě se vám nedaří fungovat okolo zdravého životního stylu v lehkosti?
>
> Vaše dítě má specifické stravovací potřeby (potravinové alergie, zácpa, nemoc...) a vy nevíte, jak na ně?
>
> Nebo máte tolik informací o výživě, že nevíte, čemu se věnovat teď a čemu potom, co je podstatné a co méně? Potřebujete se v tématu ukotvit, najít se, získat nadhled?
>
> Ze zdravého životního stylu se stalo téma a zdroj každodenní úzkosti?
>
> **Využijte naši jednorázovou konzultaci.**
>
> **Cena: 1000,- 60 minut**
>
> **Odborné vedení bez extrémů a bez strašení.**
> Pomůžeme vám zorientovat se v současných výživových trendech a oddělit podstatné od nepodstatného.
>
> **Praktické a udržitelné nastavení rodinného stravování.**
> Takové, které zapadne do vašeho života. Bez speciálních diet, bez neustálého vaření a bez pocitu, že v restauraci není co objednat a v obchodě co koupit, protože všechno obsahuje éčka nebo není dost bio.
>
> **Individuální poradenství, pokud chcete jít více do hloubky.**
> Každá rodina má jiný příběh. To, co funguje u jednoho, nemusí být cesta pro druhého. Pracujeme v kontextu vašeho životního stylu, hodnot i možností.
>
> ### Na čem si zakládáme
>
> - Nedělíme jídlo na "zdravé" a "nezdravé".
> - Nevytváříme další výživový směr ani ideologii.
> - Nejsme guru zdravého životního stylu a neděláme kroky, které u vás vytvářejí závislost na našich službách.
>
> Pracujeme s odpovědností, kontextem a dlouhodobostí.
>
> Pomáháme vám nastavit zdravý životní styl, který je udržitelný a dává smysl celé vaší rodině.
>
> **Měření na přístroji inbody 270**
>
> - Přístroj zjišťuje:
>   - Viscerální tuk
>   - Celková voda v těle
>   - Kostní/nekostní minerály
>   - Tuková hmota
>   - Kostní hmota
>   - Svalová hmota
>   - Beztuková hmota
>   - Váha
>   - BMI, procentuální podíl tělesného tuku, poměr pasu k bokům (WHR)
>   - Svalová hmota v jednotlivých tělesných částech, procento svaloviny v jednotlivých tělesných částech
>   - A další
>
> Cena bez interpretace výsledků: 250,-/10 minut
>
> Cena s interpretací výsledků: 500,-/20 minut
>
> [Chci se objednat na měření](https://www.okolokuchyne.cz/individualni-konzultace/#objednatSe)

## Summary

Build out the stub `prevence.vue` page into a full content page. This is the prevention-focused topic page under "Pro rodiče", alongside `nejedlik.vue` and `nadvaha.vue`. The page covers: prevention philosophy, what the org does, a downloadable resource (newsletter gated), consultation offer (1000 Kc/60 min), org values, and InBody 270 measurement service.

## Decisions

| Decision                                   | Choice                                                         | Rationale                                               |
| ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------- |
| Page structure                             | Follow `nejedlik.vue` pattern (sections with centered content) | Sibling topic page, consistency `[DECIDED]`             |
| "Stáhněte si zdarma" section               | Use `NewsletterForm` component with custom title/description   | Same pattern as nejedlik checklist download `[DECIDED]` |
| STOB attribution text                      | Small text below newsletter form slot                          | Spec says "malým písmem" `[DECIDED]`                    |
| "Zdravé svačinky pro mého školáka" asset   | No PDF file provided, use placeholder text in newsletter form  | Asset not available yet `[DECIDED]`                     |
| InBody booking link                        | External link to okolokuchyne.cz                               | Spec provides exact URL                                 |
| Intro list (rodinné návyky, komunikace...) | Styled as `intro-questions` list                               | Matches nejedlik pattern `[DECIDED]`                    |
| Consultation price display                 | Use `.price` class pattern from nejedlik                       | Consistent pricing display `[DECIDED]`                  |
| h1 title                                   | Keep existing "Téma mě zajímá preventivně"                     | Matches nav label from pro-rodice.vue `[DECIDED]`       |
| Lead subtitle                              | Use bold text from spec opening sentence                       | Strong opening hook `[DECIDED]`                         |

## Scope

**In scope:**

- Full `prevence.vue` page content matching spec
- Czech typography (`&nbsp;` for prepositions, proper dashes, quotes)
- Responsive styling matching sibling pages
- Newsletter form for "Zdravé svačinky" download
- InBody measurement section with external booking link

**Out of scope:**

- PDF file for "Zdravé svačinky pro mého školáka" (not provided)
- Contact form for consultation booking (page describes offer, no booking form specified)
- Changes to other pages or components

## Acceptance criteria

- [ ] `prevence.vue` renders all content sections from spec
- [ ] Page follows same layout/styling patterns as `nejedlik.vue` and `nadvaha.vue`
- [ ] Newsletter form present with "Zdravé svačinky" download framing + STOB attribution
- [ ] InBody section with pricing and external booking link
- [ ] Consultation section with pricing (1000 Kc / 60 min)
- [ ] Czech typography applied (non-breaking spaces, proper punctuation)
- [ ] `nr verify` passes
- [ ] Page visually consistent with sibling topic pages
