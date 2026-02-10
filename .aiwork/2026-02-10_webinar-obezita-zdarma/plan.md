---
status: active
---

# Plan

1. Create Directus collection `webinar_signup_form` (id, date_created, email, question)
2. Add `useWebinarSignupForm()` composable in `forms.ts`
3. Create `WebinarSignupForm.vue` component (email + question textarea + consent note)
4. Create page `web/app/pages/webinar-obezita-zdarma.vue` with webinar info + form
5. Update `nadvaha.vue` - add 4th card, change grid to 2x2
6. Run `nr verify`, fix issues
7. Visual check with browser-tools
