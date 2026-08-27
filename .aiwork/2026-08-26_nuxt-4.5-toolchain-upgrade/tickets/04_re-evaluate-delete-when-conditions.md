---
status: done
blocked_by: [03]
references:
  - "Spec: ../spec.md (gotcha 11, DELETE-WHEN conditions to re-evaluate afterwards)"
---

# 04 — Re-evaluate what the upgrade made removable

**What to build:** answers, written down, to the workarounds this upgrade may have obsoleted. None of these are removed as part of the upgrade itself — they are re-read once it is green, so a failure here can never be confused with a failure of the upgrade.

Each one ends as a recorded answer in `../notes.md`, including "still needed" and the version tested, so the next person does not retest the same thing.

## Acceptance criteria

- [x] `ogImage` `$development` block in `web/nuxt.config.ts`: `pnpm dev` retested with it removed against nuxt-og-image 6.7.8. Dropped along with its comment if the consola renderer prompt is gone; left alone with the tested version noted if it still crashes `nuxi dev`
- [x] `overrides["@vercel/nft"]: ^0.27.4` dropped and the build tried; reverted if it breaks, and either way the outcome recorded
- [x] `overrides.vite` / `overrides.vitest`, `peerDependencyRules.allowAny` and the `rolldown` devDependency each re-read against the new tree and confirmed still load-bearing
- [x] Two-Vite-majors skew re-checked: whether `@voidzero-dev/vite-plus-test` has moved past 0.1.24, and whether the `vitest-probe` DELETE-WHEN note is any closer to satisfied
- [x] All answers in `../notes.md`
