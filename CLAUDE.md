# CLAUDE.md

Educational website "Jedlík-nejedlík" (nutrition/parenting). Nuxt 4 frontend in `web/`, Directus CMS at `https://obsah-jedlika.lttr.cz`, deployed on Coolify (Nixpacks, auto-deploy on push to `master`). Czech locale, site `https://www.jedlik-nejedlik.cz`.

## Non-obvious

- SVGs in `web/app/assets/svgs/` auto-import as Vue components (via `nuxt-svgo`) — don't wrap in icon component.
- Plausible analytics ignores `localhost` and `jedlik-nejedlik-test.lttr.cz`; custom host `plausible.lttr.cz`.
- Toolchain is Vite+ (`vp`). `vp build` does NOT work — runs raw Vite which has no `index.html` entry. Use `vp run build` (= `pnpm -r run build` → `nuxi build`).
- `rolldown` is an explicit `web/` devDependency because `@nuxt/vite-builder` imports it directly when vite is aliased to `vite-plus-core` via the catalog override. Remove once Nuxt vite-builder ships vite-plus compat.
- Pre-commit hook (`vp staged`) auto-formats and `--fix`es staged files. After `git commit`, re-Read any file you still hold in context — on-disk contents may have changed.
- `session-bootstrap.sh` SessionStart hook runs `pnpm install` when `node_modules` is missing. `NUXT_PUBLIC_DIRECTUS_URL` comes from the environment (web env config; local `web/.env`), not the hook — missing it → dev 500s.
- To drive the dev server with a browser use `pnpm dev:agent`: sets `NUXT_NO_WS=1` to drop the HMR socket (vite-plus 0.2.5 double-upgrades it and crashes on connect). Page still SSRs; human `pnpm dev` keeps HMR. See the `run-jedlik-nejedlik` skill.
