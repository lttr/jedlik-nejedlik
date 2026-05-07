# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 (compat mode) frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Netlify. Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Non-obvious

- SVGs in `web/app/assets/svgs/` auto-import as Vue components (via `nuxt-svgo`) — don't wrap in icon component.
- Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`; custom host `plausible.lttr.cz`.
- Toolchain is Vite+ (`vp`). `vp build` does NOT work — runs raw Vite which has no `index.html` entry. Use `vp run build` (= `pnpm -r run build` → `nuxi build`).
- `rolldown` is an explicit `web/` devDependency because `@nuxt/vite-builder` imports it directly when vite is aliased to `vite-plus-core` via the catalog override. Remove once Nuxt vite-builder ships vite-plus compat.
- `lint` script runs `vp lint` (Oxlint, fast). `lint:slow` runs the original ESLint flat config (Nuxt-aware rules Oxlint can't replicate yet).
- Pre-commit hook (`vp staged`) auto-formats and `--fix`es staged files. After `git commit`, re-Read any file you still hold in context — on-disk contents may have changed.
- Lint+typecheck do NOT catch SSR runtime errors (broken plugins, bad runtimeConfig, unresolved `#`-imports). Any change to `web/nuxt.config.ts`, modules in `web/package.json`, `web/server/**`, or `web/app/plugins/**` requires `vp run smoke` (boots dev, fetches `/`, ~7s) before commit. Pre-commit auto-fires it on those paths; run manually if bypassing the hook.
