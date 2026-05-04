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
