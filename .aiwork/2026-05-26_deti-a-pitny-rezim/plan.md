# Plan — webinář "Děti a pitný režim"

Source: [spec.md](./spec.md). Branch: `feat/webinar-deti-pitny-rezim`.

## Decisions

| Decision               | Choice                                                                                                 | Rationale                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Registration mechanism | `WebinarSignupForm` → `webinar_signup_form` + newsletter                                               | Free webinar; matches archived free-webinar pattern. No payment (unlike generace-alfa SimpleShop).       |
| Directus change        | none                                                                                                   | `webinar` field is free varchar(255), unconstrained — new id submits fine.                               |
| Webinar id             | `2026-06-deti-pitny-rezim`                                                                             | Matches existing `YYYY-MM-slug` convention.                                                              |
| Route                  | `/webinar-deti-pitny-rezim`                                                                            | Matches `webinar-*` page convention.                                                                     |
| Reuse for 2nd webinar  | extract `WebinarCard.vue`                                                                              | Customer: 2nd free webinar over the weekend must fit "without rework" → card component + grid accepts N. |
| Photos                 | Zdeňka `a64de3ab-044d-46c7-9e4c-64f3854e93d0` (existing), Alena `588336e3-2a93-4bbd-b40c-aa8e3fa0f25a` | Given by customer.                                                                                       |
| Lecturer bios          | doc wording verbatim                                                                                   | Stay faithful to spec.                                                                                   |

## Steps

1. **Parametrize signup** — `useWebinarSignupForm(webinarId)`; `WebinarSignupForm` gets `webinarId` + `successMessage` props. Update archive caller.
2. **Landing page** `web/app/pages/webinar-deti-pitny-rezim.vue` — header/badge, intro + pain bullets, "budeme mluvit o", lecturers (2 photos), signup form. Model on `archive/webinar-obezita-zdarma.vue` + generace-alfa lecturers section.
3. **`WebinarCard.vue`** — props: to, badge, title, description, meta[]. Lift styles from pro-rodice inline `.webinar-card`.
4. **pro-rodice.vue** — add new webinar card (current) via `WebinarCard`; migrate grid to component.
5. **prevence.vue** — add visible webinar promo section linking to landing.
6. Czech typography pass on new copy.
7. Verify in browser (registration submits, photos load).

## Open

- [OPEN] generace-alfa card date `13. května` is past — leave as-is (out of scope) unless told otherwise.
- [OPEN] Capacity / "no recording" notes from archived page — not in this doc; omit unless customer wants them.
