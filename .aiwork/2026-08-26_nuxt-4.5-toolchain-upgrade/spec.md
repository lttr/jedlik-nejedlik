---
references:
  - "Dry run that surfaced this: .claude/skills/dependency-update/SKILL.md (week 2026-W35)"
  - "Why no Renovate: docs/adr/0003-pnpm-native-dependency-updates.md"
  - https://github.com/nuxt/nuxt/releases/tag/v4.5.0
  - https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.0
---

# Nuxt 4.5 + vite-plus 0.3.0 toolchain upgrade

## Goal

Move the build toolchain from Nuxt 4.4.4 to 4.5.2 in one change. That drags
Vite from 8.1.4 to 8.2.2, Rolldown from 1.0.0-rc.18 to 1.2.5, and unhead from
2.1.13 to 3.x. The whole Nuxt group moves with it.

## Why this is not a weekly dependency update

The weekly `/dependency-update` skill forbids touching exact pins and
`catalog:` aliases, and forbids widening a range to dodge a peer conflict.
Nuxt 4.5 is blocked by exactly those rows, so no number of weekly runs can
ever unblock it. Lifting the pins is a deliberate decision, and this document
records what lifting them costs.

The skill will keep reporting the Nuxt group as held until this lands. That is
correct behaviour, not a bug in the skill.

## The four coupled pins

Nothing here moves alone. All four change in one commit or none do.

| Row                 | Now                                | Target                             | Where                 |
| ------------------- | ---------------------------------- | ---------------------------------- | --------------------- |
| catalog `vite-plus` | 0.2.5 (Vite 8.1.4, Rolldown 1.1.5) | 0.3.0 (Vite 8.2.2, Rolldown 1.2.5) | `pnpm-workspace.yaml` |
| `rolldown`          | 1.0.0-rc.18 (exact)                | 1.2.5 (exact)                      | `web/package.json`    |
| `@nuxtjs/seo`       | 5.1.3 (exact)                      | 5.3.14                             | `web/package.json`    |
| Nuxt group          | nuxt 4.4.4 and friends             | nuxt 4.5.2 and friends             | `web/package.json`    |

Constraints that force each one:

- `@nuxt/vite-builder@4.5.2` depends on `vite: ^8.2.0`. Our `vite` override
  resolves to `@voidzero-dev/vite-plus-core`, and 0.2.8 was the first vite-plus
  release to bundle Vite 8.2.0.
- `nuxt@4.5.2` peers `rolldown: ~1.2.1`, and `@nuxt/vite-builder@4.5.2` peers
  `rolldown: ^1.0.0` (it was `^1.0.0-beta.38` in 4.4.4).
- `@nuxtjs/seo@5.1.3` is the unhead blocker. See the first gotcha below.

## Gotchas

### 1. unhead 2 vs 3 is a harder blocker than Vite

This is the one that would have bitten a naive upgrade, because nothing in the
Nuxt release notes points at it.

Nuxt 4.5.2 depends on `unhead ^3.3.1`. Our lockfile resolves `unhead@2.1.13`,
pulled in through `@nuxtjs/seo@5.1.3`, whose `nuxt-schema-org@6.0.4` depends on
`unhead ^2.0.7` with no v3 branch. unhead carries per-request context through a
module singleton, so two copies in one tree is a runtime bug, not a duplicated
dependency you can shrug at.

Only `@nuxtjs/seo@5.3.14` fixes it: it pulls `nuxt-schema-org@6.2.9` and
`nuxt-seo-utils@8.4.2`, both of which accept `^2.0.7 || ^3.0.0`.

So the `@nuxtjs/seo` exact pin has to lift too. Unlike the other two pins it
carries no recorded rationale. `git log -S` traces it to a bulk "Update all
dependencies" commit rather than to a documented workaround, which makes it the
lowest-risk of the three to lift.

### 2. Do not relax the rolldown pin to a range

`^1.2.1` would let pnpm float rolldown independently of the copy vite-plus
bundles. Rolldown ships a native binary, and a version skew between the two is
already documented in `vite.config.ts` as the reason `vitest-probe` exists.

Keep the pin exact and set it to whatever vite-plus bundles. For 0.3.0 that is
1.2.5, which sits inside Nuxt's `~1.2.1`. When the catalog moves again, this
number moves with it. Add a comment saying so, because the next person will
otherwise read an exact pin as arbitrary.

### 3. vite-plus renamed three environment variables with no aliases

vite-plus 0.2.8 renamed `VITE_LOG` to `VP_LOG`,
`VITE_GLOBAL_CLI_JS_SCRIPTS_DIR` to `VP_GLOBAL_CLI_JS_SCRIPTS_DIR`, and
`VITE_UPDATE_TASK_TYPES` to `VP_UPDATE_TASK_TYPES`. The old names stop working
silently rather than erroring.

A grep across the repo (excluding `node_modules`, `.git`, `.nuxt`) finds none of
them, so the repo is clean. Still check the Coolify environment and any local
shell profile, since neither is in version control.

### 4. New oxlint and oxfmt will flag code that passes today

vite-plus 0.2.6 moved to stable tsgolint 7 and updated oxlint 1.73.0 to 1.75.0
and oxfmt 0.58.0 to 0.60.0. 0.2.9 went on to oxlint 1.77.0 and oxfmt 0.62.0.
Both releases warn explicitly that the new versions report problems in code that
passed before.

`verify:check` runs `vp check`, and the pre-commit hook runs `vp check --fix`,
so expect a formatting pass and some lint fixes. Budget for them as their own
commit, separate from the version bumps, so the diff a reviewer has to read
stays about the upgrade.

Our `vite.config.ts` sets roughly seventy explicit lint rules on top of the
`correctness`, `suspicious` and `perf` categories. A rule rename upstream shows
up as an unknown-rule warning rather than a failure, so read the `vp check`
output rather than only its exit code.

### 5. vite-plus 0.3.0 relocates fresh installs

0.3.0 moves fresh installs from a single `~/.vite-plus` root to XDG base
directories on Unix. Existing installs keep their layout and the installer does
not move them, so a developer machine that already has vite-plus is unaffected.

This matters only where vite-plus gets installed from scratch, which for us is
CI and any hard-coded `~/.vite-plus/bin` path. Our Nixpacks build installs
through pnpm rather than the vite-plus installer, so the Coolify path should be
untouched. Confirm rather than assume.

### 6. The vitest half of the toolchain stays on Vite 7

`@voidzero-dev/vite-plus-test` is still at 0.1.24, and it pulls real upstream
`vite@7.3.2`. Bumping the core to 0.3.0 does not move it, so the tree keeps two
Vite majors side by side. That is already true today at 8.1.4 against 7.3.2, so
this is not a regression, but the gap widens.

`verify:test` runs the separate `vitest-probe` alias (`npm:vitest@^4.1.10`)
precisely because of this skew, so tests should be unaffected. The DELETE-WHEN
note on that alias in `vite.config.ts` stays unsatisfied.

### 7. Upstream's recommended upgrade command is wrong for this repo

Nuxt 4.5.0 recommends `npx nuxt upgrade --dedupe`. Do not run it. It rewrites
`package.json` broadly and knows nothing about our catalog, overrides or
`peerDependencyRules`, so it would walk straight into the rows this repo pins on
purpose.

Bump the named packages by hand instead, then run `pnpm dedupe` once and read
the lockfile diff. The dedupe half of upstream's advice is sound, since the unjs
ecosystem moved a lot in this release.

### 8. Nixpacks installs with a frozen lockfile

`nixpacks.toml` runs `pnpm i --frozen-lockfile`, and its `onlyIncludeFiles` list
covers `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` and
`web/package.json`. Any lockfile drift fails the deploy rather than resolving
around it, so the lockfile committed here has to be the one a clean install
produces. Node is pinned to 24 there, which satisfies rolldown 1.2.5's
`^20.19.0 || >=22.12.0`.

### 9. unhead v3 tightens useHead typing

The only breaking change Nuxt calls out for a normal app is "possible breaking
type changes from stricter `useHead` typing". We have eight `useHead` and
`useSeoMeta` call sites across `web/app/layouts/` and `web/app/pages/`.

`verify:typecheck` catches these. They belong in the code-repair commit, not the
bump commit.

### 10. The Vite 8 failure mode is a build failure, not an install failure

`peerDependencyRules.allowAny` plus `allowedVersions: vite: "*"` means pnpm
never enforces the `vite ^8.2.0` constraint. A wrong version installs cleanly
and then fails when the builder calls an API the bundled Vite does not have.

Practically: a green `pnpm install` proves nothing here. `verify:build` is the
first real signal, and a browser check is the second.

### 11. The og-image dev workaround may be removable

`web/nuxt.config.ts` disables `ogImage` under `$development` because
nuxt-og-image 6.4.9 prompts to pick a renderer at dev startup and that consola
prompt crashes `nuxi dev` with `uv_tty_init EINVAL`. `@nuxtjs/seo@5.3.14` pulls
nuxt-og-image 6.7.8.

Test `pnpm dev` with the workaround removed. If the prompt is gone, drop the
block and its comment. If it is still there, leave both alone and note the
version tested, so the next person does not retest the same thing.

### 12. Module compatibility is not a constraint

Every other Nuxt module in `web/package.json` peers `nuxt ^4` and depends on
`@nuxt/kit` with a caret, so they all resolve kit 4.5.2 on their own:
`nuxt-svgo` 5.3.0, `@nuxt/fonts` 0.14.0, `@lttr/nuxt-config-postcss` 0.0.8,
`@lttr/nuxt-validated-runtime-config` 0.1.2 and `@lttr/nuxt-config-eslint`
0.4.2. None of them blocks the upgrade or needs bumping for it.

## What rides along

These are held by the group rule today and land in the same PR:

`nuxt` 4.4.4 → 4.5.2, `vue` 3.5.33 → 3.5.41, `vue-router` 5.0.6 → 5.2.0,
`@nuxt/devtools` 3.2.4 → 3.4.2, `@nuxt/eslint` 1.15.2 → 1.17.0, `@nuxt/icon`
2.2.1 → 2.5.1, `@nuxt/image` 2.0.0 → 2.1.0, `@vueuse/core` and `@vueuse/nuxt`
14.3.0 → 14.4.0, `@dxup/nuxt` 0.2.2 → 0.5.10, `@nuxtjs/plausible` 3.0.2 → 4.0.0.

Two of those carry breaking changes of their own, both already checked against
this codebase and clear:

- `@nuxtjs/plausible` 4.0.0 requires Nuxt 4 (satisfied), forwards only three
  headers through its proxy, and stops registering the proxy route when
  `enabled` is false. Our config sets only `ignoredHostnames` and `apiHost` and
  never uses the proxy, so neither applies.
- `@dxup/nuxt` 0.5.10 is mostly the named-layout-slots feature. Both our layouts
  use a plain unnamed `<slot>`.

## Order of work

Three commits, in this order, so a reviewer can read the interesting one alone.

1. **Pins and bumps.** Catalog to vite-plus 0.3.0 in `pnpm-workspace.yaml`.
   In `web/package.json`, rolldown to 1.2.5, `@nuxtjs/seo` to 5.3.14, and the
   Nuxt group. Then `pnpm dedupe`, and nothing else. Quote the exact commands
   in the commit body.
2. **Formatting and lint.** Whatever `vp check --fix` produces from the new
   oxlint and oxfmt. Mechanical, reviewable by skimming.
3. **Code repair.** unhead v3 typing fixes and anything `verify:build` turns up.
   This is the commit that gets read properly.

## Verification

`vp run verify:all` is the gate, as always. It is not sufficient here.

Because the Vite mismatch fails at build rather than install, and because unhead
carries request context that no unit test exercises, add:

- `pnpm dev:agent` and a browser pass over a page that uses `useSeoMeta`, a page
  that renders a Directus image, and one form.
- Inspect the rendered `<head>` on a page using `@nuxtjs/seo`, since the whole
  unhead risk lands there and typechecking will not see it.
- `vp run directus:probe` is not needed unless `directus/config/**` or
  `web/server/**` changes, which this upgrade should not touch.

## Rollback

The lockfile is the whole state. Reverting the three commits and running
`pnpm i --frozen-lockfile` restores the current tree, and nothing here writes
outside the repo except the vite-plus install directory, which 0.3.0 leaves
alone on an existing machine.

Deploy risk is a failed Coolify build rather than a bad release, since Nixpacks
builds before it swaps. The failure worth watching for is a green build that
renders wrong head tags.

## DELETE-WHEN conditions to re-evaluate afterwards

Do not remove these as part of the upgrade. Re-read them once it is green, and
record the answer in `notes.md`.

- `overrides.vite` / `overrides.vitest`: still needed. `@nuxt/vite-builder`
  declares plain upstream `vite` as a direct dependency, and nothing in Nuxt 4.5
  mentions vite-plus.
- `peerDependencyRules.allowAny`: still needed, and it does real work during
  this upgrade. Without it the install fails outright on the `vite@^8` peer.
- `overrides["@vercel/nft"]: ^0.27.4`: unknown. nitropack is current at 2.13.4
  while upstream nft is at 1.11.0. Nuxt 4.5 changes the build layer, so this is
  the natural moment to try dropping the override and see whether Nitro and
  Vite+ now agree. Try it, and revert if the build breaks.
- The `rolldown` devDependency itself: still needed. Nuxt 4.5.2 made rolldown a
  peer "to reuse vite's copy", which is a step toward removing it but not the
  removal.

## Out of scope

- The nine-package safe batch from the week 2026-W35 dry run. It is independent
  of all of this and should ship as its own PR, before or after.
- The `vitest` to `vite-plus-test` alias, and the `vitest-probe` workaround that
  exists because of it. That waits on vite-plus-test catching up with the CLI.
- Nuxt 5. `future.compatibilityVersion: 5` exists in 4.5, but opting in is a
  separate decision with its own spec.
