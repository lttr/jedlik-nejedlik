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
