# Dependency update: weekly cloud routine

The `/dependency-update` skill runs the same way however it is triggered. The
Claude Code cloud routine invokes it weekly on Monday with a one-line prompt
("Run the `/dependency-update` skill.") in a dedicated environment:

- Environment variables: `NUXT_PUBLIC_DIRECTUS_URL` only. Cloud environments
  have no secrets store and their values are readable by anyone using the
  environment, so no tokens go in. `vp run build` must therefore succeed without
  `SENTRY_AUTH_TOKEN` (sourcemap upload skipped). If it does not, that is a bug
  in the build, never a reason to add the credential.
- Network access: Custom = default allowlist plus `obsah-jedlika.lttr.cz`. The
  scan also needs `registry.npmjs.org` and `api.github.com`; add them to the
  Custom list if a run shows them blocked.
- Every MCP connector is removed from the routine. A dependency job must not be
  able to write to the CMS.
- Setup script installs Node 24.15.0, pins pnpm 11.2.2 via corepack and runs
  `pnpm fetch`. The install itself is left to `session-bootstrap.sh` so the
  lockfile this run is about to change stays authoritative.
- Pausing the process means disabling the routine's schedule: nothing in the
  repo needs changing, and the skill stays invocable by hand.
