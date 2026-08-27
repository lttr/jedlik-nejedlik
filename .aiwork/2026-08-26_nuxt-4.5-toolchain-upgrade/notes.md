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
| catalog `vite-plus`               | 0.3.0 (specifier now exact `0.3.0`, was `latest`)    |
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

## Ticket 03 — what the new toolchain actually needed

Nothing, beyond one formatting file.

- oxfmt 0.64 reformatted exactly one file; oxlint 1.79 reported **no** warnings,
  lint errors or type errors across 98 files, and **no unknown-rule warnings** —
  so none of the ~70 explicit rules in `vite.config.ts` was renamed upstream.
- `vp run verify:all` green first try, `verify:build` included.
- unhead v3's stricter `useHead` typing broke none of the eight
  `useHead` / `useSeoMeta` call sites.
- The rendered `<head>` is correct and per-request isolated: four routes each
  render their own canonical, `og:url` and title.

### Dev server binds IPv6 only

`pnpm dev:agent` listens on `[::1]:3000`. `curl 127.0.0.1:3000` fails with
exit 7; use `localhost:3000`. Worth knowing before assuming the server is dead.

### unhead v3 deprecation warnings are @nuxtjs/seo's, not ours

Dev console shows `[unhead] twitter:image / twitter:image:type /
twitter:image:width / twitter:image:height / twitter:card is deprecated. Use
Open Graph metadata instead.` and `[unhead] promise ignored: tags:resolve`.
These come from `@nuxtjs/seo`'s site-config defaults. Console-only, no rendering
effect. Do not go looking for them in our call sites.

## Ticket 04 — the DELETE-WHEN re-evaluation

Two workarounds removed, three confirmed still load-bearing, one unchanged.

### REMOVED — the `ogImage` `$development` block in `web/nuxt.config.ts`

**Tested against nuxt-og-image 6.7.8** (was 6.4.9), pulled by `@nuxtjs/seo`
5.3.14.

The consola renderer prompt is gone. It now emits a warning instead of asking:

    [@nuxtjs/og-image] WARN Unable to detect @takumi-rs version.
                           Falling back to Takumi v1 renderer compatibility.

`nuxi dev` starts and serves with the block removed — no `uv_tty_init EINVAL`
anywhere in the startup log. The block and its comment are deleted.

With the module live in dev, `og:image` is now an absolute URL
(`http://localhost:3000/og-image.png`) rather than the bare relative
`og-image.png` it rendered while disabled. `/og-image.png` serves 200
`image/png`. The `/__og-image__/…` runtime route stays 404 — expected, we set
`ogImage.zeroRuntime: true`.

### REMOVED — `overrides["@vercel/nft"]: ^0.27.4`

Dropped, and the build was tried as the spec asked. It does not break.

nitropack 2.13.4 now resolves `@vercel/nft` **1.11.0** on its own, and the
lockfile gets smaller for it. Note that `glob@7.2.3` does **not** leave the
tree: nft was only one of its two dependents, and `stylus@0.57.0` (a
vite-plus-core optional peer) still pulls it, so `pnpm install` keeps warning
about it. `vp run verify:all` is green.

A green build is not enough evidence here — nft's job is tracing files into the
server bundle, so a bad trace fails at _runtime_ with a missing module. Also,
running `.output` from inside the repo proves nothing, because the repo's own
`node_modules` is still resolvable from there. So `.output` was copied outside
the repo and started there: six routes (`/`, `/o-nas`, `/podcast`,
`/webinar-deti-pitny-rezim`, `/kontakt`, `/pro-rodice`) all return 200 with a
clean log. The trace is complete.

### STILL NEEDED — `overrides.vite` / `overrides.vitest`

`@nuxt/vite-builder@4.5.2` declares `vite: ^8.2.0` as a **direct dependency**,
not a peer, so without the override Nuxt installs plain upstream Vite and never
sees vite-plus. Nothing under `node_modules/nuxt/dist` or
`node_modules/@nuxt/vite-builder/dist` mentions vite-plus, so Nuxt 4.5 ships no
compat of its own. Unchanged trigger.

### STILL NEEDED — `peerDependencyRules.allowAny`, but the stated reason has changed

Removed it and re-resolved to find out. **The install does not fail.** Under
pnpm 11.2.2 the missing rules produce warnings, not an error, and
`pnpm install` still exits 0. The spec's "without it the install fails outright
on the `vite@^8` peer" is no longer accurate.

What it actually does now is suppress exactly two unmet-peer reports, and
nothing else. `pnpm peers check` without the rules:

    ✕ unmet peer vitest  installed 0.1.24, wanted 4.1.11
    ✕ unmet peer vite    installed 0.3.0,  wanted ^5 || ^6 || ^7 || ^8

(both caused by vite-plus's version string, which satisfies no upstream range),
plus two unrelated pre-existing ones (`eslint` for eslint-plugin-unicorn,
`cac` for @bomb.sh/tab) that the rules never covered and that remain either way.

Kept: the noise is real and would bury a genuine peer problem. But it is a
warning-suppression rule now, not the thing holding the install up.

### STILL NEEDED — the `rolldown` devDependency

`nuxt@4.5.2` peers `rolldown: ~1.2.1`, and it is **not** listed in
`peerDependenciesMeta`, so it is a required peer, not an optional one.
`@nuxt/vite-builder@4.5.2` peers `rolldown: ^1.0.0` as well. Making it a peer
"to reuse vite's copy" is a step toward removal, not the removal — we still
have to supply it. Keep the exact 1.2.5 pin.

### UNCHANGED — the two-Vite-majors skew and `vitest-upstream`

`@voidzero-dev/vite-plus-test` is **still 0.1.24**; that is npm `latest`, not a
stale lockfile entry. It still pulls real upstream `vite@7.3.2`, so the tree
keeps Vite 8.2.2 (vite-plus-core 0.3.0) alongside Vite 7.3.2 — the gap widened
exactly as the spec predicted.

The `vitest-upstream` DELETE-WHEN in `vite.config.ts` is **not** closer to
satisfied. If anything the skew got worse: vite-plus 0.3.0 dropped the
`./binding` export that vite-plus-test's core 0.1.24 relies on, which is why
this upgrade had to add
`overrides["@voidzero-dev/vite-plus-core"]: 0.3.0` (see ticket 02). That new
override carries the same DELETE-WHEN trigger, so three things now wait on
vite-plus-test catching up with the CLI:

- `vitest-upstream` in `web/package.json` + the `verify:test` command
- `overrides["@voidzero-dev/vite-plus-core"]`
- `peerDependencyRules` for `vitest`

## Wrap-up — review findings acted on

`/code-review xhigh --fix` over the whole branch returned 14 findings. Most were
documentation drift: comments this upgrade made false. Three needed real work.

### ANSWERED — is `NUXT_NO_WS` still needed? No. Workaround removed.

This was the one DELETE-WHEN condition ticket 04's acceptance criteria missed,
and the ticket-03 browser pass could not have caught it: it ran `pnpm dev:agent`,
which disables the very socket in question.

Tested directly on vite-plus 0.3.0: started plain `pnpm dev` (HMR on), connected
a real browser, and left it connected.

- The dev server **did not crash**. No `uv_tty_init` / `EINVAL` in the log.
- No reconnect loop — 25s of steady state produced no `[vite]` console output.
  (Earlier "server connection lost" lines were stale history from the
  `dev:agent` servers killed during ticket 03, not a live symptom.)
- **HMR actually works end to end**: edited an `<h1>` in `web/app/pages/kontakt.vue`,
  the server logged `hmr update /pages/kontakt.vue`, and the live DOM changed
  from `"Kontakt"` to `"HMRPROBE Kontakt"` without a reload. Edit reverted.

So the workaround is gone: the `ws` const and `vite.server.ws` in
`web/nuxt.config.ts`, and `NUXT_NO_WS=1` from the `dev:agent` script.
`dev:agent` stays as plain `nuxi dev` — still useful, because it skips the
`vp run` wrapper so the server owns the terminal.

### FIXED — `@types/node` drifted to 26 while the runtime is Node 24

`pnpm dedupe` floated it 25.6.0 → 26.3.0 as an auto-installed peer with no
manifest row, so it drifts freely on every dedupe. Meanwhile `.node-version` is
24.15.0 and `nixpacks.toml` pins `NIXPACKS_NODE_VERSION = '24'`.

That gap is a real runtime hazard: server code using a Node 26-only API would
typecheck and build clean, then throw on the Node 24 Coolify container. Added an
explicit `"@types/node": "^24.10.1"` to `web/devDependencies` (resolves 24.13.3).
`vp run verify:all` green, so nothing depended on the newer types.

### FIXED — CLAUDE.md told the reader to break the tree

`CLAUDE.md` said the `rolldown` devDependency comes out when the vite-plus
override does. It does not: `nuxt@4.5.2` peers `rolldown: ~1.2.1` **non-optionally**.
A future session following that note would have deleted a required peer. Corrected,
along with the stale `NUXT_NO_WS` / vite-plus 0.2.5 note in both `CLAUDE.md` and
`.claude/skills/run-jedlik-nejedlik/SKILL.md`.

### Corrections to earlier notes in this folder

- The catalog row is an **exact** `0.3.0`, not `^0.3.0`. A caret would let
  `pnpm update` float the CLI while `overrides["@voidzero-dev/vite-plus-core"]`
  held the core at 0.3.0 — reintroducing exactly the skew that broke the install
  on the 0.2.5 → 0.3.0 move.
- `glob@7.2.3` did **not** leave the tree with the `@vercel/nft` override.
  `stylus@0.57.0` is a second dependent, so `pnpm install` still lists it among
  the deprecated subdependencies. An earlier note and the body of commit 46914af
  claim otherwise; they are wrong.

### Left for the maintainer, deliberately

- **Drop the aliased `vitest` entirely.** Nothing in the repo executes
  vite-plus-test — every test runs through `vitest-upstream`. Removing the
  `vitest` devDep, the `vitest` override and the catalog row would delete the
  two-core condition, the new `@voidzero-dev/vite-plus-core` override and one
  `peerDependencyRules` entry in one move. Correct, but a structural change
  deserving its own spec rather than a wrap-up edit.
- **`@dxup/nuxt`, `@dxup/unimport` and `@nuxt/devtools` are redundant rows** —
  `nuxt@4.5.2` depends on them and auto-registers them. Defensible to keep
  explicit; a maintainer call.
- **Two CLAUDE.md convention conflicts.** Ticket 03's acceptance criteria
  mandate running `vp check` / `vp check --fix` directly, which CLAUDE.md
  forbids ("never run the underlying tools standalone"). One of the two has to
  give. And the standalone-`.output` proof for the `@vercel/nft` removal was
  never promoted to a test, which CLAUDE.md requires of any curl-based proof —
  it needs a build-output smoke check that does not exist yet.
