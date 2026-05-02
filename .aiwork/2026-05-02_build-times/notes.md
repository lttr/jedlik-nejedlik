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
