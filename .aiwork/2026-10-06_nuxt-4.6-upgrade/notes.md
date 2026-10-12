# Notes: Nuxt 4.6 upgrade

## Step 2: Nuxt 4.6 plus modules (2026-10-12)

- `nuxt` 4.6.1 (published 2026-10-09, past the release-age gate), `vue-router` 5.4.0,
  `@sentry/nuxt` 11.6.0, `@types/node` 26.6.5, `eslint-plugin-baseline-js` 0.7.4
  (0.7.5 exists but is inside the gate), `fallow` 3.33.1, `vue-tsc` 3.3.13.
- Not taken: `@directus/sdk` 27 (major, not this spec), `@nuxt/devtools` 4 beta,
  `typescript` 7, `h3` 2.
- `vue-tsc` stays. `nuxi typecheck` resolves `vue-tsc/bin/vue-tsc.js` at
  runtime (CLI v4 `typecheck` command), so fallow can't see the use. It's now in
  `ignoreDependencies`.
- `check:typecheck` wall time before the upgrade: 6.8 s (`nuxi typecheck`, warm).

### CLI v4

- `@nuxt/cli` 4.0.1. `nuxi` isn't deprecated: `nuxi`, `nuxt` and `nuxt-cli` are
  all bins of the same entry. The scripts stay on `nuxi`.
- `nuxt dev` shows the TUI panel only in an interactive terminal. It falls back to
  plain logs when stdout isn't a TTY, so `dev:agent` (piped into `grep`) is
  unaffected. `--no-tui` / `NUXT_TUI=plain` would force it.
- Engines: Nuxt 4.6.1 needs Node `^22.22.3 || ^24.15.0 || >=26`. CLI v4 needs
  `^24.11.0`.

### Coolify Node version

- The last production build used Nixpacks `nodejs_24` from nixpkgs
  `23f9169c…`, which is **24.10.0**. That fails both ranges.
- Pinned `[phases.setup] nixpkgsArchive` to nixos-26.05 `6fcc1603…`
  (`nodejs_24` = 24.21.0; `pnpm_9`, which Nixpacks also asks for, still exists
  there). Pnpm itself still comes from corepack.
