# Build times — 2026-05-02

Baseline timing run after dep update (commit `5cc816b`). Branch `master`.

| Command              | real      | user      | sys      | Result              |
| -------------------- | --------- | --------- | -------- | ------------------- |
| `pnpm run format`    | 0m1.187s  | 0m1.944s  | 0m0.165s | clean               |
| `pnpm run lint`      | 0m1.539s  | 0m2.080s  | 0m0.250s | 0 errors, 1 warning |
| `pnpm run build`     | 0m46.160s | 0m33.125s | 0m3.251s | ok                  |
| `pnpm run typecheck` | 0m4.864s  | 0m7.562s  | 0m0.789s | clean               |

## Build output

- Total: 21.5 MB / 6.77 MB gzip
- Nuxt 4.4.4, Nitro 2.13.4, Vite 7.3.2, Vue 3.5.33
- 855 client modules
- Preset: `node-server`

## Env

- pnpm 10.33.2
- Node: system default

## Post-migration — 2026-05-04

After Vite+ migration (commits `a787109`, `6678346`, `916dcf9`). Branch `master`.
Each command run 3× back-to-back; warm caches throughout. Variance <3% across runs — averages reported.

| Command              | real      | user      | sys      | Result            |
| -------------------- | --------- | --------- | -------- | ----------------- |
| `vp fmt --check`     | 0m1.045s  | 0m9.759s  | 0m1.143s | clean (oxfmt)     |
| `vp lint`            | 0m0.718s  | 0m2.727s  | 0m0.609s | 0 errors (oxlint) |
| `pnpm run build`     | 0m32.188s | 0m29.443s | 0m3.948s | ok                |
| `pnpm run typecheck` | 0m4.944s  | 0m7.668s  | 0m0.921s | clean             |

### Build output

- Total: 21.4 MB / 6.76 MB gzip
- Nuxt 4.4.4, Nitro 2.13.4, Vite 0.1.20 (vite-plus-core, reports `vite v8.0.10`), Vue 3.5.33
- 856 client / 376 server modules
- Preset: `node-server`

## Diff vs baseline

| Command   | Before            | After           | Δ                    |
| --------- | ----------------- | --------------- | -------------------- |
| format    | 1.187s (prettier) | 1.045s (oxfmt)  | −12% (tool swap)     |
| lint      | 1.539s (eslint)   | 0.718s (oxlint) | **−53%** (tool swap) |
| build     | 46.160s           | 32.188s         | **−30.3%**           |
| typecheck | 4.864s            | 4.944s          | +1.6% (noise)        |

### Parallelism (user/real ratio)

| Command   | Before | After | Note                               |
| --------- | ------ | ----- | ---------------------------------- |
| format    | 1.64×  | 9.34× | oxfmt uses 20 threads, prettier ~2 |
| lint      | 1.35×  | 3.80× | oxlint parallel, eslint not        |
| build     | 0.72×  | 0.91× | **<1** = wall-clock bound, idle    |
| typecheck | 1.55×  | 1.55× | vue-tsc unchanged                  |

- Build u/r < 1 in both cases: pipeline serialized + waiting (Sentry source map upload, client→server→nitro). More cores won't help; future wins need parallelized phases or removed waits.
- oxfmt does ~5× the CPU work in same wall time → headroom to grow codebase before format becomes the bottleneck.
- `sys` modest across the board (~3–4s on build, sub-second elsewhere); tracks file I/O, no anomaly.

### Notes

- `format`/`lint` not apples-to-apples: prettier→oxfmt, eslint→oxlint. Old eslint flat config retained as `vp run lint:slow` for Nuxt-aware rules oxlint can't replicate yet.
- Build win is the headline: ~14s shaved, mostly from Rolldown + vite-plus-core.
- Lint −53%: oxlint vs eslint is the biggest dev-loop quality-of-life gain.

## Post oxlint rule expansion — 2026-05-06

After oxlint rule expansion (commits `33ea0cf` → `1117bcd`). Branch `master`, HEAD `1117bcd`.
3× back-to-back, warm caches, variance <3%, averages reported.

Rule count: oxlint defaults only → **273 rules** (categories: correctness/suspicious/perf as error + tiered explicit rules).

| Command              | real      | user      | sys      | Result             |
| -------------------- | --------- | --------- | -------- | ------------------ |
| `vp fmt --check`     | 0m1.046s  | 0m10.089s | 0m1.169s | clean (oxfmt)      |
| `vp lint`            | 0m0.867s  | 0m3.392s  | 0m0.684s | 0 errors (oxlint)  |
| `vp check`           | 0m1.703s  | 0m12.972s | 0m1.771s | clean (fmt + lint) |
| `pnpm run build`     | 0m32.222s | 0m30.728s | 0m4.034s | ok                 |
| `pnpm run typecheck` | 0m5.259s  | 0m8.124s  | 0m0.902s | clean              |

### Build output

- Total: 21.4 MB / 6.76 MB gzip (unchanged)
- Nuxt 4.4.4, Nitro 2.13.4, Vite 0.1.20 (vite-plus-core), Vue 3.5.33
- 856 client modules
- Preset: `node-server`

### Diff vs post-migration (2026-05-04)

| Command   | 05-04   | 05-06   | Δ             |
| --------- | ------- | ------- | ------------- |
| format    | 1.045s  | 1.046s  | +0.1% (noise) |
| lint      | 0.718s  | 0.867s  | **+20.8%**    |
| build     | 32.188s | 32.222s | +0.1% (noise) |
| typecheck | 4.944s  | 5.259s  | +6.4%         |

### Notes

- Lint +20.8% (~150ms) is the cost of going from oxlint defaults to 273 explicit rules across 9 plugins. Still 4.4× faster than the eslint baseline (1.539s) — budget well intact.
- Typecheck +6.4% likely noise / vue-tsc cache state; no typecheck-relevant changes landed.
- Build/format unchanged as expected (rule expansion is lint-only).
- u/r ratio for lint dropped from 3.80× to 3.91× — still parallel-bound, no thread saturation issue.
- `vp check` (1.703s) vs sum of separate fmt+lint (1.913s): −11% from shared startup. Use it as the pre-commit gate.
