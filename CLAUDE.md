# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 (compat mode) frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Netlify. Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Non-obvious

- SVGs in `web/app/assets/svgs/` auto-import as Vue components (via `nuxt-svgo`) — don't wrap in icon component.
- Directus URL duplicated in `web/nuxt.config.ts` and `web/shared/utils/directus.ts` — keep in sync.
- Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`; custom host `plausible.lttr.cz`.
