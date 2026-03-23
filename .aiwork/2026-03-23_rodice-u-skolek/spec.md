---
status: active
---

# Rodiče u školek - vzdělávací programy pro rodiče

## Original request

> Pokračovat za to, co už tam je nejprve tímto textem:
>
> **Rodiče jako klíčová součást změny**
>
> Jste pedagog nebo pracovník školní jídelny, dává vám smysl to, co ve škole pro děti děláte, ale občas narážíte na to, že doma to funguje jinak? Nebo máte naopak velmi spolupracující rodiče a chcete, aby na vaše úsilí navázali i oni a děti dostávaly podobné signály v obou prostředích?
>
> Táhněte společně za jeden provaz.
>
> Uspořádejte ve vaší mateřské škole vzdělávací program pro rodiče. V naší organizaci realizujeme pro rodiče formy besedy, přednášky či setkání s prvky workshopu. Pomůžeme vám otevřít téma dětského stravování citlivě, srozumitelně a bez zbytečného strašení či obviňování.
>
> Rodiče se dozví:
>
> - proč děti jedí tak, jak jedí,
> - jak nastavit doma prostředí u jídla tak, aby podporovalo spolupráci místo konfliktů,
> - jak reagovat na odmítání jídla, vybíravost nebo „extrémní chutě" růstovým způsobem,
> - jak podpořit dítě v rozvoji dovedností spojených s jídlem,
> - jak navázat na aktivity a snahy školky doma,
> - kde je hranice mezi běžným vývojem a situací, kdy už je vhodné řešit věc s odborníkem.
>
> Cílem není rodiče poučovat, ale propojit školu a rodinu tak, aby dítě dostávalo konzistentní, bezpečné a podpůrné vedení.
>
> Na to, co děláte ve školce nebo škole, tak může přirozeně navázat i domácí prostředí – změna má pak mnohem větší šanci fungovat dlouhodobě.
>
> **Co vám v rámci vzdělávání rodičů můžeme nabídnout:**
>
> **TADY UŽ TO DÁT DO TĚCH RÁMEČKŮ JAKO TU NABÍDKU PRO ŠKOLKY**
>
> **O JÍDLE SE S DĚTMI (NE)MLUVÍ** - přednáška, 90-120 min, 4000 Kč + cestovné, max 50 osob
>
> **KDYŽ DÍTĚ NEJÍ PODLE NAŠICH PŘEDSTAV** - beseda, 90-120 min, 4000 Kč + cestovné, max 20 osob
>
> **VÝŽIVA DĚTÍ JEDNODUŠE A PRAKTICKY** - přednáška, 90-120 min, 4000 Kč + cestovné, max 50 osob

## Summary

Add parent education section to existing `pro-odborniky/skoly.vue` page. Intro text followed by 3 product-box offerings, matching existing visual pattern.

## Decisions

| Decision                  | Choice                                        | Rationale                                                                                                                                                      |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where to add content      | Append to `pro-odborniky/skoly.vue`           | Spec says "pokračovat za to, co už tam je" [DECIDED]                                                                                                           |
| Visual pattern            | Reuse `.product-box` aside pattern            | Spec explicitly references "rámečky jako tu nabídku pro školky"                                                                                                |
| Heading level for section | h2 for section title, h3 for individual boxes | h2 already used for existing product boxes; use h2 for "Rodiče jako klíčová součást změny" section heading and h3 inside boxes to maintain hierarchy [DECIDED] |

## Scope

**In:** Intro text, 3 product boxes with descriptions/pricing, Czech typography

**Out:** New pages, new components, CMS integration, contact forms

## Acceptance criteria

- [ ] Parent education section visible after existing school offerings
- [ ] 3 product boxes with correct content, pricing, capacity
- [ ] Product boxes use same visual style as existing ones
- [ ] Czech typography rules applied (non-breaking spaces, proper dashes)
- [ ] Page passes verify (lint, typecheck)
