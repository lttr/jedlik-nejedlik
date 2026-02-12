---
status: active
---

# Nejedlíci page - spec

## Summary

Replace stub `/nejedlik` page with full content about picky eaters. Add newsletter signup form at the bottom that incentivizes with a free PDF checklist download (Directus asset `a50cceb7-1ca5-4f16-bcdf-10515cae0ff7`). Same pattern as the previous Christmas cookies desatero.

## Original spec

> See ~/Downloads/Nejedlíci.md (full content transcribed in conversation context)

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
