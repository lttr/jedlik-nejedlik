# Cloud routines

Two Claude Code cloud routines run against this repo. Each prompt is one line
pointing at a file in `.claude/routines/`, so the instructions live in the repo
and the routine only sets the schedule.

| Routine                              | ID                              | Prompt                                         |
| ------------------------------------ | ------------------------------- | ---------------------------------------------- |
| Jedlik-nejedlik: Update dependencies | `trig_01HXqebA86DYfPRmbgWfkUri` | Follow `.claude/routines/nuxt-deps-update.md`. |
| Check docs                           | `trig_01AFpg9JoWUtYNetxHkVHaQJ` | Follow `.claude/routines/docs-update.md`.      |

Both run weekly on `master` in the `jedlik-nejedlik` environment. To pause one,
disable its schedule; the file can still be run by hand.

## Environment

- The only variable is `NUXT_PUBLIC_DIRECTUS_URL`. Anyone using the environment
  can read its values, so no tokens go in. `vp run build` must therefore work
  without `SENTRY_AUTH_TOKEN`; if it doesn't, fix the build.
- Network: the default allowlist plus the Directus host. If a run shows a host
  blocked, add it to the list.
- No MCP connectors, so no routine can write to the CMS.
- The setup script doesn't run `pnpm install`; `session-bootstrap.sh` does, so
  the lockfile a run is about to change stays authoritative.
- `scripts/cloud-setup.sh` installs the `maintenance` plugin both routine files
  rely on. Local sessions don't load it.
