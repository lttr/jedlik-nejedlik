# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 (compat mode) frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Netlify. Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Non-obvious

- SVGs in `web/app/assets/svgs/` auto-import as Vue components (via `nuxt-svgo`) — don't wrap in icon component.
- Directus URL duplicated in `web/nuxt.config.ts` and `web/shared/utils/directus.ts` — keep in sync.
- Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`; custom host `plausible.lttr.cz`.
- Toolchain is Vite+ (`vp`). `vp build` does NOT work — runs raw Vite which has no `index.html` entry. Use `vp run build` (= `pnpm -r run build` → `nuxi build`).
- `rolldown` is an explicit `web/` devDependency because `@nuxt/vite-builder` imports it directly when vite is aliased to `vite-plus-core` via the catalog override. Remove once Nuxt vite-builder ships vite-plus compat.
- `lint` script runs `vp lint` (Oxlint, fast). `lint:slow` runs the original ESLint flat config (Nuxt-aware rules Oxlint can't replicate yet).
