---
created: 2026-03-25
type: plan
status: completed
completed: 2026-03-25
commit: d5147e7
---

# Smazání webináře (stránka zůstane v archivu, formulář zachován)

## Context

Webinář "Dětská obezita v otázkách a odpovědích" (24. března) proběhl. Zdeňka chce:

- Smazat stránku `/webinar-obezita-zdarma` - ANO
- Smazat odkaz z `/nadvaha` - ANO
- Zachovat formulář pro příští webinář - ANO
- Smazat emaily/otázky z Directus - NE

## Steps

1. **Přesunout stránku do archivu**
   - `web/app/pages/webinar-obezita-zdarma.vue` → `web/archive/webinar-obezita-zdarma.vue`

2. **Odstranit odkaz z nadvaha.vue** (řádky 60-63)
   - Smazat `<NuxtLink to="/webinar-obezita-zdarma" ...>` blok
   - Smazat nepoužitý styl `.offer-link-free`

3. **Ponechat beze změn:**
   - `WebinarSignupForm.vue` - komponenta pro příští webinář
   - `useWebinarSignupForm()` v `composables/forms.ts` - composable pro příště
   - Data v Directus (`webinar_signup_form` kolekce) - Zdeňka nechce mazat

## Files

- `web/app/pages/webinar-obezita-zdarma.vue` → archive
- `web/app/pages/nadvaha.vue` - remove link
- `web/app/pages/pro-rodice.vue` - bez změn (webinář tam není, jen commented-out sekce)

## Verify

- `nr verify`
- Check `/nadvaha` in browser - no webinar link
- Check `/webinar-obezita-zdarma` returns 404
