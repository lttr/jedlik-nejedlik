# Implementation notes

## Setup

Working on branch `chore/nuxt-4.5-toolchain-upgrade`, cut from `master` at
`cb7d0e7`. Tickets are strictly serial (01 → 02 → 03 → 04), so the frontier is
never wider than one ticket and no worktree isolation is used.

## Ticket 01 — pre-flight the out-of-repo surfaces

Done. All three checks came back negative; details and the negative results are
in `notes.md` so a future session does not repeat them.

Nothing ambiguous in this ticket, no deviation from the spec.

## Ticket 02 — bump the four coupled pins

Done. All thirteen specifier rows moved and nothing else did; the lockfile diff
contains no other `specifier:` change.

### Deviation: the catalog row could not stay on `latest`

The spec's table reads "catalog `vite-plus` 0.2.5 → 0.3.0 in
`pnpm-workspace.yaml`", but the file did not hold a version at all — the row was
`vite-plus: latest`, with the lockfile carrying the actual 0.2.5 pin.

`pnpm update vite-plus vite vitest` re-resolved it and rewrote the specifier to
`^0.3.0` on its own. Leaving it on `latest` would desync the lockfile from the
manifest (which `--frozen-lockfile` rejects, and therefore the Coolify deploy
too), so the row now carries a version. It is the **exact** `0.3.0`, not the
caret pnpm wrote: `overrides["@voidzero-dev/vite-plus-core"]` pins the core to
exactly 0.3.0 and `web/package.json` pins `rolldown` to exactly 1.2.5, so a
caret would let `pnpm update` float the CLI to 0.3.x while those two stayed
put — reproducing the CLI/core skew that broke `pnpm install` on this very
upgrade. That also makes the coupling the spec insists on visible in the file a
reader opens: the exact `rolldown` pin next door tracks _this_ number.

The `vite` / `vitest` alias rows are untouched and still resolve `@latest`; they
are out of scope per the spec.

### Blocker found and fixed: vite-plus 0.3.0 dropped the `./binding` export

Not anticipated by the spec, and it broke `pnpm install` outright — every `vp`
invocation, including the root `prepare` script, died with "Cannot find native
binding".

Chain:

1. `overrides.vitest` rewrites **every** `vitest` dependency in the tree,
   including vite-plus 0.3.0's own internal `vitest: 4.1.11`, to
   `@voidzero-dev/vite-plus-test@latest` — still 0.1.24.
2. vite-plus-test 0.1.24 depends on `@voidzero-dev/vite-plus-core@0.1.24`, so
   two cores land in the tree.
3. `shamefullyHoist: true` elevates exactly one of them to the root
   `node_modules`, and it picked 0.1.24.
4. `vp` resolves the core from the project root, so it loaded 0.1.24, whose
   native-binding shim falls back to `require("vite-plus/binding")` — an export
   vite-plus **0.3.0 removed**. 0.2.5 still had it, which is why this never bit
   before.

Fix: one more line in `overrides`, forcing a single
`"@voidzero-dev/vite-plus-core": 0.3.0`, carrying the same ISSUE / DELETE-WHEN
comment shape as its neighbours. It collapses the two copies, so hoisting has
nothing to get wrong.

Safe because nothing in this repo executes vite-plus-test: `verify:test` and
`directus:probe` both run upstream vitest through the `vitest-upstream` alias
(see `vite.config.ts`). Its DELETE-WHEN is the same trigger as that alias's.

This is a strict widening of ticket 02's stated "no config changes beyond the
version rows", and it is not optional — without it the tree does not install,
so `pnpm i --frozen-lockfile` (and therefore Nixpacks) fails.

### Confirmed against the installed tree, not just the release notes

- `@nuxt/vite-builder@4.5.2` resolves `vite` → `@voidzero-dev/vite-plus-core`
  **0.3.0**, which declares `vite: 8.2.2` — satisfying its `vite ^8.2.0` peer.
- vite-plus-core 0.3.0 declares `rolldown: 1.2.5`, so the exact pin is right;
  1.2.5 also sits inside nuxt 4.5.2's `~1.2.1`. (npm `latest` for rolldown is
  already 1.2.6 — deliberately not taken, per spec gotcha 2.)
- Exactly one `unhead` in the lockfile, at **3.4.0**. The v2 copy is gone.
- Exactly one `rolldown`, at 1.2.5.
- `pnpm i --frozen-lockfile` succeeds from a trashed `node_modules`.

### Incidental

`pnpm dedupe` also floated a batch of transitive versions (`@types/node`
25.6.0 → 26.3.0, `jiti`, `terser`, `yaml`, `lightningcss`, `rollup`). Expected —
the spec asks for the dedupe precisely because the unjs ecosystem moved.

### Second unlisted blocker: TypeScript had to be pinned explicitly

`nuxi typecheck` failed immediately after the bump:

    .nuxt/tsconfig.app.json(237,5): error TS5023: Unknown compiler option 'libReplacement'.

Nuxt 4.5 emits `libReplacement` into the generated tsconfig, and that option
landed in TypeScript 5.8. The repo had no `typescript` row at all — 5.7.3 was an
auto-installed peer, and `pnpm dedupe` does not re-resolve those, so it stayed
put while everything around it moved.

Added `"typescript": "^5.9.3"` to `web/devDependencies`. It is a version row, so
it rides in the bump commit rather than the code-repair one; ticket 03 stays
about source. Deliberately not TypeScript 6 (vue-tsc 3.2.7 would accept it at
`<6.1.0`, but a compiler major is its own decision, not a side effect of a Nuxt
bump).

With that in place `nuxi typecheck` is clean — including the eight `useHead` /
`useSeoMeta` call sites the spec expected unhead v3 to break (gotcha 9). No
source change was needed for them.

## Ticket 03 — get the new toolchain green

Done, and cheaper than the spec budgeted for.

### The code-repair commit does not exist

The spec planned two commits here: a mechanical `vp check --fix` pass, then a
code-repair commit for unhead v3's stricter `useHead` typing and whatever
`verify:build` turned up. Only the first was needed.

- `vp check --fix` touched exactly one file, `web/layers/directus/shared/utils/schemas.ts`
  — oxfmt 0.64 now hugs a call whose only argument is an arrow function.
  Committed on its own as planned.
- `vp check` then reported _"Found no warnings, lint errors, or type errors in
  98 files"_. No unknown-rule warnings, so none of our ~70 explicit rules was
  renamed upstream. Nothing to update in the lint config.
- `vp run verify:all` was green on the first attempt, `verify:build` included.
  The Vite 8 mismatch the spec flagged as a build-time failure (gotcha 10) never
  materialised: `@nuxt/vite-builder` 4.5.2 gets vite-plus-core 0.3.0 = Vite 8.2.2.
- The eight `useHead` / `useSeoMeta` call sites needed no change. `nuxi typecheck`
  is clean — once TypeScript was pinned to 5.9 in ticket 02, which was the only
  typing casualty of the whole upgrade.

So there is no third commit. Writing an empty one to match the spec's shape
would be worse than saying why it is missing.

### Browser pass

`pnpm dev:agent`, driven with agent-browser. Note the dev server binds `[::1]`
only — `curl 127.0.0.1:3000` fails, `localhost:3000` works.

- `/webinar-deti-pitny-rezim` — `useSeoMeta`, a Directus image and the webinar
  signup form on one page. SSRs 200, hydrates, no console errors.
- Form is live: typing works, and submitting with an invalid e-mail is blocked
  by the required/`type=email` validation. Deliberately not submitted for real —
  that would create an actual newsletter record against the live service.
- `/podcast` and `/o-nas` — Directus assets from `obsah-jedlika.lttr.cz` decode
  at full size (300×300, 800×450, 800×451), including lazy ones after scroll.
  Screenshot confirms fonts, nav, auto-imported SVGs and layout intact.

### Rendered `<head>` — the actual unhead risk

Inspected on `/webinar-deti-pitny-rezim`, and cross-checked across four routes.
Correct and, crucially, **not leaking between requests**: `/`, `/podcast`,
`/o-nas` and `/webinar-generace-alfa` each render their own canonical, `og:url`
and title. That is the failure mode the unhead-2-and-3-side-by-side hazard would
have produced, and it is absent.

Present and correct: `<title>`, `description`, `canonical`, `og:type`,
`og:title`, `og:description`, `og:url`, `og:site_name`, `twitter:card`, the
icon set, and the dev-time `robots: noindex, nofollow` carrying
`data-production-content="index, follow, …"`.

### Two observations, neither a regression

- unhead v3 logs dev-only deprecation warnings for `twitter:image*` and
  `twitter:card` ("use Open Graph metadata instead"), plus one
  `[unhead] promise ignored: tags:resolve`. These come from `@nuxtjs/seo`'s own
  site-config defaults, not from our call sites, and are console warnings only.
  Left alone: chasing them means patching a dependency's output.
- `/webinar-generace-alfa` renders a doubled suffix,
  "Webinář: Generace alfa u stolu | Jedlík-nejedlík | Jedlík-nejedlík". Its
  `useSeoMeta` hardcodes the suffix that the site template already appends.
  Pre-existing page authoring (unchanged since commit 6bcb4fd), not caused by
  this upgrade, and out of scope here.

## Ticket 04 — re-evaluate what the upgrade made removable

Done. Full answers in `notes.md`; summary:

- **Removed** the `ogImage` `$development` block — nuxt-og-image 6.7.8 warns
  instead of prompting, and `nuxi dev` starts clean.
- **Removed** `overrides["@vercel/nft"]` — nitropack 2.13.4 resolves nft 1.11.0
  on its own and the traced output runs standalone outside the repo.
- **Kept** `overrides.vite`/`vitest`, `peerDependencyRules.allowAny` and the
  `rolldown` devDependency, each re-checked against the installed tree.
- Two-Vite-majors skew: unchanged and slightly worse; `vitest-upstream`'s
  DELETE-WHEN is not closer.

### Correction to the spec

The spec asserts that without `peerDependencyRules.allowAny` "the install fails
outright on the `vite@^8` peer". Removed and re-resolved to check: under pnpm
11.2.2 it does not — `pnpm install` exits 0 and the missing rules only turn two
suppressed reports into warnings. Kept anyway (warning noise would bury a real
peer problem), but the recorded reason is now accurate.

### Note on pnpm's up-to-date check

After removing an override from `pnpm-workspace.yaml`, plain `pnpm install` —
and even `pnpm install --force` — reported "Already up to date" and left the
lockfile's `overrides:` block stale, while `node_modules` had already moved to
the new resolution. `pnpm dedupe` is what actually re-resolved it. Worth knowing:
a stale lockfile here means a failed Coolify deploy, since Nixpacks installs
`--frozen-lockfile`. Verified afterwards with a clean
`trash-put node_modules && pnpm i --frozen-lockfile`.
