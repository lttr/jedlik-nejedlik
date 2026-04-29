# Plan — Webinář Generace alfa u stolu

## Decisions

| Decision                    | Choice                                                                                                                    | Rationale                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| URL slug                    | `/webinar-generace-alfa`                                                                                                  | Matches naming style (`konzultace-deti-obezita`); descriptive        |
| Page structure              | Single-file `.vue` page, no shared component                                                                              | Simpler than course (12 weeks); only 1 landing                       |
| Visual style                | Reuse tokens/sections from `ObesityCoursePromo.vue` (hero, cta-button, faq-style sections)                                | Consistency                                                          |
| Czech quotes                | `&bdquo;...&ldquo;` HTML entities                                                                                         | Codebase convention (commit f26af21)                                 |
| nbsp on 1-char prepositions | `&nbsp;` after `k s v z o u i a`                                                                                          | Match other pages                                                    |
| TODO L27 (autorita)         | Reformulate: "k autoritě se staví jinak — méně automaticky ji přijímají, víc očekávají vysvětlení"                        | Editor said "přeformulovat", picked positive concrete framing        |
| TODO L51 (komunikace)       | Use spec's positive form as-is                                                                                            | Already resolved in spec                                             |
| TODO L104 (CTA)             | Render as `<a class="cta-button primary large" href="https://form.simpleshop.cz/n05o4/buy/">Koupit webinář za 290 Kč</a>` | Direct from spec                                                     |
| Nav linking                 | Not added to MainNav                                                                                                      | Standalone landing for paid traffic; matches `2026-online-kurz-deti` |

## Steps

1. Create `web/app/pages/webinar-generace-alfa.vue`
2. Sections: hero (title + intro pains) → kdo jsou Gen Alpha → co se dozvíte → co bude jiné → pro koho je / není → co získáte + bonus → cena 290 Kč + CTA → FAQ → CTA repeat
3. Apply Czech typography (nbsp, &hellip;, &bdquo;&ldquo;, en-dashes)
4. Resolve gdoc escapes (`29\.` → `29.`)
5. SEO meta (title, description)
6. /verify
7. Browser preview localhost:3000/webinar-generace-alfa

## Open questions

- Final wording for "jinak vnímají autoritu" — current draft is interpretation; editor may prefer different phrase
- Should bonus zoom date "15.&nbsp;6." include year? Spec doesn't specify
- SEO description text (drafted from spec opening)
