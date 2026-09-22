---
name: nuxt-deps-update
description: Dependency update run for this repo. Wraps the generic /maintenance:dependency-update skill with the rules that only hold here — the Nuxt group, the four-row vite-plus toolchain set, auto-import usage search, and hoist skew. Use when the user says "dependency update", "update deps", "dry run the dep update", or when the weekly cloud routine fires.
disable-model-invocation: true
argument-hint: "[dry-run]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch
---

# Dependency update (this repo)

The procedure lives in the **`/maintenance:dependency-update`** skill: preflight
stop conditions, the scan, release notes, batch-vs-migration shaping, the
two-commit split, the bounded repair loop, the run note and the PR body. Follow
it end to end.

This file carries only what that skill deliberately does not know. Where the two
disagree, this file wins.

## Run the scan with our glob

The generic scan takes a `--tsconfig-paths` glob so it can correlate
duplicate-major packages against the copy a framework actually resolved. Ours
is Nuxt's generated server tsconfig.

Run the scan exactly as §1 of `/maintenance:dependency-update` gives it — that
skill resolves its own script path — and append our flag:

```
--tsconfig-paths='**/.nuxt/tsconfig.server.json'
```

Then read the result:

```bash
jq '.manager, .counts' /tmp/dep-scan.json
jq '[.duplicateMajors.duplicates[] | select(.pathsAt != null)]' /tmp/dep-scan.json
```

That second query is the one that matters: `duplicates` alone is ~114 rows here
and almost all of them are harmless. The rows carrying a `pathsAt` are the ones
Nuxt maps, and those are the ones that can break typecheck.

If `web/.nuxt/tsconfig.server.json` is missing, `pathsAt` comes back null on
every row. Run `vp install` and scan again rather than reporting "no skew".

## Project facts the generic skill assumes it must look up

- **Base branch** is `master`, and a push to it triggers the Coolify deploy.
  Merging the PR deploys to production.
- **The gate** is `vp run check:all`, run bare. Per `CLAUDE.md` nothing ships on
  a subset, and caching makes repeats free.
- **The run note** goes to `.aiwork/{TODAY}_dep-update/notes.md`.
- **Workarounds and their conditions** are the `# ISSUE:` / `# DELETE WHEN:`
  comment pairs in `pnpm-workspace.yaml`. Read that file in full during §1;
  it is the authoritative record, and the conditions there are what the PR
  body's DELETE-WHEN section reports on.

## The Nuxt group is indivisible

`nuxt`, `@nuxt/*`, `@nuxtjs/*`, `vue`, `vue-router`, `nitropack` and the
vite/vitest catalog entries move together or not at all. Never ship half of it:
these peer-depend on each other at ranges a partial bump satisfies on paper and
breaks at build time, and the failure names a package you did not touch.

## The four-row toolchain set

`pnpm-workspace.yaml` documents this at length under `catalog:` — read it there
rather than trusting this summary. The short form:

- `catalog.vite` (aliased to `@voidzero-dev/vite-plus-core`), `catalog.vite-plus`,
  and `rolldown` + `vitest` in `web/package.json` are **four exact pins that
  move as one**. A caret or `latest` on any of them lets `pnpm update` float one
  member while the other three stay put.
- **Why rolldown is declared at all:** `nuxt` peers `rolldown: ~1.2.1` and does
  not mark it optional. (`@nuxt/vite-builder` peers it too, but optionally — the
  hard requirement is nuxt's own.) Verify against the installed
  `node_modules/nuxt/package.json` rather than assuming; it changes per release.
- **Why it is an exact pin rather than a range:** `vite-plus` has no `rolldown`
  entry in its manifest at all, neither dependency nor peer. Rolldown is
  vendored inside `@voidzero-dev/vite-plus-core` and reached through export
  subpaths. Nothing in the dependency graph relates our copy to the vendored
  one, so no resolver will ever reconcile them — the pin is what keeps the
  separately installed native binary identical to the vendored one. A range
  would satisfy nuxt's peer range perfectly and still drift off the copy `vp`
  actually runs.
- **Read the vendored versions from `vp toolchain`**, which prints the chain
  (`vite-plus` → core → `bundles rolldown@X`, `bundles vite@Y`), not from
  `vite-plus`'s manifest where rolldown does not appear.
- A skew here broke `pnpm install` outright during the 0.2.5 → 0.3.0 upgrade
  (`.aiwork/2026-08-26_nuxt-4.5-toolchain-upgrade/notes.md`, ticket 02). Treat
  that as the reason the pins exist, not as something to re-test.

Bump all four together to whatever a new `vite-plus` release bundles, or bump
none of them.

## Auto-imports have no import statement

Nuxt auto-imports composables, components and utils. "Find all usages" means
`rg '\bmyComposable\b' web/app web/server web/layers` or LSP references — never
an import graph, and never the conclusion "no import found, so it is unused".
That conclusion feels certain and is wrong. Search the bare name, because a
symbol can also arrive through `#imports`, `#app` or a `~/` alias.

## Hoist skew

`shamefullyHoist: true` means exactly one copy of a duplicated package reaches
the root `node_modules`, and Nuxt's generated tsconfig `paths` map bare imports
at whichever copy landed there. Install order decides that, not the lockfile, so
a regen can flip it with nothing in the diff to explain why.

That is what `h3` did on 2026-09-03: v2 arrived transitively with
`@nuxt/eslint`, outranked nitro's v1 at the root, and broke typecheck in every
`web/layers/*/server` file. The fix — an exact `h3` pin in `web/package.json`
naming the copy nitro resolves — is documented as an `# ISSUE:` / `# DELETE
WHEN:` pair in `pnpm-workspace.yaml`.

`ofetch` is the standing next candidate: also installed at two majors, and
currently correct only by luck of the hoist. Report both rows in the PR body
every run, whether or not this run tripped on them.

## Known, not yet documented in the workspace file

Upstream `vite@7.3.2` is in the tree and is what the hoisted root
`node_modules/vite` points at, pulled in by `autoInstallPeers` as a
peer-resolution key. No importer declares it. The `vite: "catalog:"` override
does correctly redirect `@nuxt/vite-builder` to core 0.3.0, so the copy that
matters is right — but this is the same shape as the h3 incident and nothing in
`pnpm-workspace.yaml` mentions it. Re-check it each run; if a second real vite
starts reaching something that matters, it needs its own ISSUE comment.

## PR body

Use the generic skill's section list, with one substitution: where it says
**Duplicate majors**, report the `pathsAt` rows described above under the
heading **Hoist skew**, naming the majors installed and which one Nuxt's
tsconfig currently points at.

Runtime behaviour against the live Directus CMS and visual rendering are never
verified by `check:all`. They belong in **Not verified** every time.

The weekly cloud routine that triggers this skill is documented in
`docs/dependency-update-cloud-routine.md`.
