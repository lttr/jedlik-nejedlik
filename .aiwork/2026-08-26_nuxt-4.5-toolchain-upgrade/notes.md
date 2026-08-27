# Notes — Nuxt 4.5 + vite-plus 0.3.0 toolchain upgrade

## Ticket 01 — out-of-repo pre-flight

All three checks are **negative**. Nothing outside version control needs to
change before the pins move.

### Renamed environment variables (spec gotcha 3)

vite-plus 0.2.8 renamed `VITE_LOG` → `VP_LOG`,
`VITE_GLOBAL_CLI_JS_SCRIPTS_DIR` → `VP_GLOBAL_CLI_JS_SCRIPTS_DIR` and
`VITE_UPDATE_TASK_TYPES` → `VP_UPDATE_TASK_TYPES`, with no aliases and no error
on the old names.

| Surface                                                 | Result                                                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coolify `jedlik-nejedlik-production` (`g8000og`)        | Only `NUXT_SITE_ENV`, `NODE_OPTIONS`, `NUXT_PUBLIC_DIRECTUS_URL`. No `VITE_*`.                                                                            |
| Local shell profiles                                    | No hits in `~/.bashrc`, `~/.bash_profile`, `~/.profile`, `~/.zshrc`, `~/.zshenv`, `~/.zprofile`, `~/.config/fish/config.fish`, `~/.config/environment.d/` |
| Live shell environment                                  | No hits                                                                                                                                                   |
| Repo (excl. `node_modules`, `.git`, `.nuxt`, `.output`) | Only the `.aiwork/` spec and ticket prose                                                                                                                 |

Nothing to rename.

### XDG install relocation (spec gotcha 5)

vite-plus 0.3.0 moves _fresh_ installs off a single `~/.vite-plus` root. It
cannot reach the deploy:

- `nixpacks.toml` installs with
  `npm install -g corepack@latest && corepack enable` then
  `pnpm i --frozen-lockfile`. The vite-plus installer script is never invoked.
- `vite-plus` is a plain npm devDependency of the workspace root; the `vp`,
  `vpr`, `oxlint` and `oxfmt` binaries are shipped in the package's own `bin/`
  and `binding/`, resolved through `node_modules/.bin`. The `bin/vp` shim
  contains no `~/.vite-plus`, `XDG` or `HOME` reference.
- No hard-coded `~/.vite-plus` path exists anywhere in the repo (the only
  matches are prose in `.aiwork/`).
- The Coolify app has no `install_command` / `build_command` override, so
  `nixpacks.toml` is the whole story.

This developer machine already has `~/.vite-plus`; 0.3.0 leaves existing
installs where they are, so local layout is unaffected too.

## Ticket 02 — what the new tree actually resolves

Verified on disk after a clean `pnpm i --frozen-lockfile`, not from release
notes:

| Thing                             | Resolves to                                          |
| --------------------------------- | ---------------------------------------------------- |
| catalog `vite-plus`               | 0.3.0 (specifier now `^0.3.0`, was `latest`)         |
| `@voidzero-dev/vite-plus-core`    | 0.3.0 — declares vite 8.2.2, rolldown 1.2.5          |
| `@nuxt/vite-builder@4.5.2`'s vite | vite-plus-core 0.3.0 → satisfies `vite ^8.2.0`       |
| `rolldown`                        | 1.2.5, single copy (npm latest is 1.2.6 — not taken) |
| `unhead`                          | **3.4.0, single copy** — the v2 blocker is gone      |
| `vitest` (alias)                  | `@voidzero-dev/vite-plus-test` 0.1.24, still         |
| `vitest-upstream`                 | vitest 4.1.10 — what actually runs the tests         |
| oxlint / oxfmt / tsgolint         | 1.79.0 / 0.64.0 / 7.0.2001                           |

### New workaround added: a single vite-plus-core

`overrides["@voidzero-dev/vite-plus-core"]: 0.3.0` in `pnpm-workspace.yaml`.

vite-plus **0.3.0 removed the `./binding` subpath export** that 0.2.5 had. The
`vitest` override drags vite-plus-test 0.1.24 — and with it core 0.1.24 — into
the tree; `shamefullyHoist` elevated that stale core over the 0.3.0 one, and its
binding shim falls back to `require("vite-plus/binding")`. Every `vp` call died
with "Cannot find native binding", including the root `prepare` script, so
`pnpm install` itself failed.

Forcing one core collapses the two copies. Nothing here executes
vite-plus-test, so pinning its core forward costs nothing. DELETE WHEN
vite-plus-test catches up with the CLI — the same trigger as the
`vitest-upstream` alias.
