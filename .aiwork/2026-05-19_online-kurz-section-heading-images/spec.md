# Spec — Responsive section headings with images (2026-online-kurz-deti)

## Original request

> Implement responsive headings with images on page 2026-online-kurz-deti. Images are in ~/Downloads/im. The 3 illustration images show the desired look: headings with blob-shaped photo images (with decorative fruit/veg accents) placed beside the heading text. Headings: "Proč je náš kurz funkční a bezpečný?", "Jak kurz probíhá?", "Jak se tento kurz liší od běžných programů?", "Co kurz záměrně nedělá", "V čem je náš kurz jedinečný?"

## Summary

Add blob-shaped photo images beside 5 section headings in `ObesityCoursePromo.vue`.
Source images already include decorative fruit/veg accents and transparent background.
Layout: image left, heading right on desktop; stacked (image above heading) on mobile.

## Decisions

| Decision                  | Choice                                    | Rationale                                          |
| ------------------------- | ----------------------------------------- | -------------------------------------------------- |
| Image storage             | `web/public/images/online-kurz-deti/`     | matches existing `/images/` convention             |
| Heading→image map         | see scope                                 | matched by visual theme                            |
| Markup                    | plain `<img loading="lazy">`              | decorative, already small webp (33–62 KB)          |
| Desktop layout            | image left, heading right, group centered | matches illustrations                              |
| Mobile layout `[DECIDED]` | image above heading, centered             | illustration shows desktop only; stack is standard |
| Image width               | ~clamp 200–320px                          | fits beside heading without dominating             |

## Heading → image map

| Section               | Heading                                    | Image                 |
| --------------------- | ------------------------------------------ | --------------------- |
| `.why-section`        | Proč je náš kurz funkční a bezpečný?       | proc-funkcni.webp (9) |
| `.format-section`     | Jak kurz probíhá                           | jak-probiha.webp (12) |
| `.not-doing-section`  | Co kurz záměrně nedělá                     | co-nedela.webp (10)   |
| `.unique-section`     | V čem je náš kurz jedinečný?               | jedinecny.webp (8)    |
| `.comparison-section` | Jak se tento kurz liší od běžných programů | jak-se-lisi.webp (11) |

## Scope

In: 5 section headings get a paired image, responsive layout.
Out: other sections, hero, copy changes, new components.

## Acceptance criteria

- Each of the 5 headings shows its image beside it on desktop.
- On mobile the image stacks above the heading; nothing overflows.
- `/verify` passes.
