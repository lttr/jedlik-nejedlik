---
references:
  - "Spec: ./spec.md"
  - "Branch: chore/nuxt-4.5-toolchain-upgrade"
  - "Reviewed: /code-review xhigh --fix over the whole branch diff"
---

# Review — Nuxt 4.5 + vite-plus 0.3.0 toolchain upgrade

## Outcome

Green. `pnpm i --frozen-lockfile` from a trashed `node_modules` followed by a
cold `vp run verify:all` (0/8 cache hits, full `nuxi build`) exits 0. Working
tree clean.

Six commits, all four tickets done.

## What the review found

14 findings. The striking thing is the shape: **not one was a bug in shipped
code**. Twelve were documentation drift — comments and notes that the upgrade
itself had made false — and two were latent risks the upgrade widened.

That is roughly what this change is: the code did not need repair, so the
review surface was the reasoning around the code.

### Fixed during wrap-up

| #   | Finding                                                                                                                                                                               | Fix                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Catalog `vite-plus` was a range `^0.3.0` while its two hand-coupled pins are exact — the neighbouring comment literally says the pin "must never become a range"                      | Pinned exact `0.3.0`, lockfile regenerated                                                |
| 2   | `CLAUDE.md` and the `overrides.vite` DELETE-WHEN both said removing the vite alias also drops the `rolldown` devDep — **false**, `nuxt@4.5.2` peers `rolldown: ~1.2.1` non-optionally | Corrected both; the note would have instructed a future session to delete a required peer |
| 3   | `peerDependencyRules` comment claimed the install _errors_ without it — ticket 04 had already proven otherwise                                                                        | Rewritten to say what was verified: warnings, exit 0                                      |
| 5   | Four workaround notes still blamed "vite-plus 0.2.5", and `NUXT_NO_WS` was the one DELETE-WHEN nobody re-tested                                                                       | Tested it properly (below) and removed the workaround                                     |
| 6   | Comment pointed at `web/vite.config.ts`; the file is at the repo root                                                                                                                 | Path corrected                                                                            |
| 7   | Notes and commit 46914af claimed `glob@7.2.3` left the tree with the nft override — it did not, `stylus@0.57.0` still pulls it                                                        | Corrected in notes                                                                        |
| 8   | `@types/node` floated to 26.3.0 while the runtime is pinned to Node 24                                                                                                                | Pinned `^24.10.1` in `web/devDependencies`                                                |

### The one that mattered most

Finding 5 exposed a **structural blind spot**, not just a stale comment. Ticket
03's browser pass ran `pnpm dev:agent`, which sets `NUXT_NO_WS=1` — so the pass
that was supposed to validate the dev server ran with the very feature the
workaround disables. It could never have discovered the workaround was obsolete.

Tested directly: plain `pnpm dev` (HMR on), real browser connected. Server did
not crash, no reconnect loop over 25s, and a live HMR update applied — edited an
`<h1>`, the server logged `hmr update /pages/kontakt.vue`, the DOM changed
without a reload. The vite-plus 0.2.5 double-upgrade bug is fixed in 0.3.0, so
the workaround is gone.

Worth remembering: _a verification path that routes around the thing being
verified proves nothing about it._

### Deliberately not fixed

- **Drop the aliased `vitest` entirely.** The strongest finding structurally
  (#4). Nothing in the repo executes vite-plus-test — everything runs through
  `vitest-upstream`. Removing the `vitest` devDep, override and catalog row
  would eliminate the two-core condition, the new
  `@voidzero-dev/vite-plus-core` override _and_ one `peerDependencyRules` entry
  at once. As shipped, three workarounds now share one DELETE-WHEN trigger and
  the block grows with each vite-plus bump. This is correct but is a structural
  dependency change deserving its own spec, not a wrap-up edit.
- **`@dxup/nuxt`, `@dxup/unimport`, `@nuxt/devtools` redundancy** (#10, #11).
  `nuxt@4.5.2` depends on them and auto-registers them. Keeping them explicit is
  defensible; a maintainer call.
- **Two CLAUDE.md convention conflicts** (#9, #14), both needing a human
  decision:
  - Ticket 03's acceptance criteria _mandate_ running `vp check` / `vp check --fix`
    directly, which CLAUDE.md forbids ("never run the underlying tools
    standalone"). The ticket cannot be completed without violating the rule —
    one of the two has to give.
  - The standalone-`.output` proof for the `@vercel/nft` removal was never
    promoted to a test, which CLAUDE.md requires of any curl-based proof. It
    needs a build-output smoke check that does not exist yet, and the next
    nitropack/nft bump has no regression net without it.

## Deploy risk

Unchanged from the spec's assessment: a failed Coolify build rather than a bad
release, since Nixpacks builds before it swaps. The lockfile reproduces from
clean, which is the thing `--frozen-lockfile` would otherwise fail on.

The residual risk the spec names — "a green build that renders wrong head tags" —
was checked directly: four routes each render their own canonical, `og:url` and
title, so unhead's per-request context is not leaking.
