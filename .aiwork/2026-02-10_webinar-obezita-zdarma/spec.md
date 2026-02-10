---
status: active
---

# Webinar zdarma - promo na stránce nadváhy

## Customer spec

> Do sekce nadváha pro rodiče dát toto - dát to tam dolů jako čtvrtý obdélníček na výběr pro rodiče - a následně to 10. 3. SMAZAT
>
> **Dětská obezita v otázkách a odpovědích - webinář zdarma - 9. března od 19:00**
>
> Dětská obezita nevzniká přes noc a její řešení není nikdy jen o jídle... V rámci Světového dne obezity otevíráme prostor pro vaše rodičovské otázky k tématu dětské nadváhy a obezity. Začínáme v 19:00 a během jedné hodiny vám budeme odpovídat na vaše dotazy. Z webináře NEBUDE pořizován záznam, aby bylo zajištěna psychická pohoda všech zúčastněným a mohli jste se bez obav ptát na cokoliv, co vás k tématu zajímá.
>
> Kapacita 100 osob.
>
> Přihlašování zde DÁT SEM FORMULÁŘ, KDE SE VYPLŇUJE MAIL A DOTAZ (Na co bych se chtěl/a na webináři zeptat?)
>
> Zase tam napsat, že odesláním se přihlašují k odběru novinek. A asi k tomu dát nějakou fotku z fotobanky obézního dítěte, klidně takovou, kterou už někde máme.

## Summary

Add a 4th offer card on `/nadvaha` linking to a new `/webinar-obezita-zdarma` page. The page contains webinar details (March 9, 19:00, capacity 100, no recording) and a signup form (email + question). Form also subscribes to newsletter. Temporary - remove after March 10.

## Decisions

| Decision           | Choice                                  | Rationale                                                 |
| ------------------ | --------------------------------------- | --------------------------------------------------------- |
| Page vs section    | Separate page `/webinar-obezita-zdarma` | Consistent with other offer cards linking to detail pages |
| Form collection    | `webinar_signup_form` in Directus       | Follows existing `*_form` naming convention               |
| Newsletter consent | Consent note (same as NewsletterForm)   | Spec says "odesláním se přihlašují k odběru novinek"      |
| Stock photo        | Skip for now [DECIDED]                  | No specific image available; can be added later by client |
| Grid layout        | 2x2 on desktop, 1col on mobile          | 4 items in 3-col grid looks unbalanced                    |

## Scope

**In scope:**

- 4th card on `/nadvaha` page
- New page `/webinar-obezita-zdarma` with webinar info + signup form
- Directus collection `webinar_signup_form` (email, question)
- Form composable `useWebinarSignupForm()`
- Form component `WebinarSignupForm.vue`
- Newsletter consent note

**Out of scope:**

- Stock photo (client can add)
- Auto-removal on March 10 (manual task)
- Email notification/automation in Directus

## Acceptance criteria

- [ ] `/nadvaha` shows 4 offer cards in 2x2 grid
- [ ] 4th card links to `/webinar-obezita-zdarma`
- [ ] Webinar page shows event details (date, time, capacity, no recording)
- [ ] Form has email (required) and question (textarea) fields
- [ ] Form submits to Directus `webinar_signup_form` collection
- [ ] Newsletter consent note present
- [ ] Success state shown after submission
- [ ] `nr verify` passes
