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
`^0.3.0` on its own. Rather than fight pnpm back to `latest` and leave the
lockfile and the manifest disagreeing (which `--frozen-lockfile` rejects, and
therefore the Coolify deploy too), the catalog row is now `^0.3.0`. That also
makes the coupling the spec insists on visible in the file a reader opens: the
exact `rolldown` pin next door tracks _this_ number.

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
