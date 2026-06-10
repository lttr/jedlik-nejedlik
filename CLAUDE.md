# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Coolify (Nixpacks, auto-deploy on push to `master`). Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Non-obvious

- SVGs in `web/app/assets/svgs/` auto-import as Vue components (via `nuxt-svgo`) — don't wrap in icon component.
- Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`; custom host `plausible.lttr.cz`.
- Toolchain is Vite+ (`vp`). `vp build` does NOT work — runs raw Vite which has no `index.html` entry. Use `vp run build` (= `pnpm -r run build` → `nuxi build`).
- `rolldown` is an explicit `web/` devDependency because `@nuxt/vite-builder` imports it directly when vite is aliased to `vite-plus-core` via the catalog override. Remove once Nuxt vite-builder ships vite-plus compat.
- Pre-commit hook (`vp staged`) auto-formats and `--fix`es staged files. After `git commit`, re-Read any file you still hold in context — on-disk contents may have changed.
