# Implementation notes — Auth / customers layer (area 02)

Chronological log. Workflow events plus decisions that were not settled by
`spec.md`.

## 2026-08-10

- Area 02 had no spec or tickets — only the six-line paragraph in
  `../2026-06-09_kurzy-platforma/implementation-areas.md`. Wrote
  `spec.md` + four tickets before touching code.
- Three decisions were taken by the user at the clarity gate rather than
  by the spec author: spec-first over code-first, Directus public
  registration over a service-token route, and `nuxt-auth-utils` over a
  hand-rolled h3 sealed session.
- **Deviation from `/aiwork:implement`:** the skill has the orchestrator
  spawn one subagent per ticket. This session runs the ticket loop inline
  instead — the session instructions forbid the Agent tool unless the user
  asks for it. No effect on the artifacts; only on who executes them.
- Ticket 04 is human-only by construction (instance settings + a real
  inbox), same shape as area 01's FP-11 ticket. Tickets 01–03 are written
  so an agent can finish them without instance access.
- Ticket 01 started.

### Toolchain: catalog pinned, `latest` was a trap

`pnpm --filter web add nuxt-auth-utils` re-resolved the `latest` catalog
entries as a side effect and took the toolchain from vite-plus 0.2.5 to
0.2.8 (oxlint 1.73 → 1.76, lightningcss 1.32 → 1.33). That left
`vite-plus-core@0.1.24` — pulled in by `vite-plus-test`, the `vitest` alias
— resolved against a new peer hash (`esbuild@0.28.0` instead of `0.27.7`)
whose optional `@voidzero-dev/vite-plus-linux-x64-gnu` binding pnpm then
skipped. `vp config` died with "Cannot find native binding", which breaks
the root `prepare` script and therefore every install. A clean
`rm -rf node_modules && pnpm install` reproduced it, so it was the graph,
not a partial install.

Fix: pinned `vite`, `vitest` and `vite-plus` in the `pnpm-workspace.yaml`
catalog to the versions the lockfile already held. Adding the dependency
then left the rest of the graph untouched. This is a deliberate policy
change to a file whose comment block says these entries are workarounds to
be deleted as the ecosystem matures — the pin does not change _what_ the
workarounds do, only that upgrading them is now an explicit act. **Bump
them in their own commit** so a toolchain upgrade is never collateral
damage from adding an unrelated dependency.

### `scripts/smoke-dev.sh` orphans dev servers

Its trap kills `$PID`, which is the `npx` wrapper, not the `nuxi` child.
Every smoke run therefore leaves a dev server alive on `SMOKE_PORT`
(3199). The next run's server cannot acquire Nuxt's dev lock and exits,
while curl happily talks to the **stale** process still holding the port.

Cost during this session: an early smoke picked up a startup-race 500
("NUXT_PUBLIC_DIRECTUS_URL is missing" — the config is fine, the request
just arrived before the runtime config was applied), and that orphan then
returned the same 500 to every later run, which read as a hard,
reproducible failure. The reverse is worse and is the real risk: once an
orphan is warm it answers 200, so smoke can pass without ever testing the
code just written.

Fixed here rather than left for later: it stopped being cosmetic once it
hung `vp run verify:all` outright, and a check that can silently pass
against stale code is worse than one that fails. `setsid` puts the server
in its own process group and the trap kills the group.

### Deviation: `/simplify` run inline

The skill fans out four review agents; the session instructions forbid the
Agent tool unless the user asks. Ran the four angles (reuse,
simplification, efficiency, altitude) inline instead. Two findings applied:
extracted `useAuthRequest` (the pending/error pair was already duplicated
across two pages and tickets 02–03 add four more), and collapsed three
identical clear-session-and-401 blocks in `getStudentToken` into one local
helper.

### oxlint cannot resolve `#auth-utils`

`nuxt-auth-utils` types its session API through the `#auth-utils`
specifier. oxlint's type-aware pass does not resolve it — `#`-prefixed
specifiers are Node subpath imports and the package declares none — so
`useUserSession`, `getUserSession`, `setUserSession` and everything derived
from them arrive as `any`, tripping the `no-unsafe-*` family: 23 errors
across six files. `nuxi typecheck` (vue-tsc, via `.nuxt/tsconfig.json`)
resolves the alias and checks these files properly, and it runs in
`verify:all`, so the types stay enforced — just not by oxlint.

Added a scoped override in `vite.config.ts` listing exactly the six files
that touch the session API, following the precedent already there for
`eslint.config.js` (a JS-only package landing as `any`). New auth routes
that do not read a session must not be added to it.

Everything _not_ caused by that was fixed rather than swept into the
override: the `as` casts became a `readUnknownProp` narrowing helper, the
parameterised test tables got explicit tuple types, and the route
middleware became `async` for `promise-function-async`.

Related trap: oxlint reads the on-disk `.nuxt`, so it reported 36 phantom
errors against auto-imports that simply were not in the generated types
yet. `nuxi prepare` cleared them. `nuxi typecheck` regenerates first and
never sees this, which makes the two disagree in a confusing way.

### Two type errors the layer config hid

`routeRules: { "/prihlaseni": { robots: false } }` does not typecheck in a
layer — nuxt-robots augments the route-rule type in the root app, and a
layer config is typed against the base schema. Replaced with per-page
`useSeoMeta({ robots: "noindex, nofollow" })`. Separately,
`runtimeConfig.session` must satisfy the whole `SessionConfig`, so it
carries a `password: ""` placeholder next to `maxAge` for the env override
to target.

### The unit tests earned their keep immediately

`directusErrorCode` called `readUnknownProp` through the layer auto-import.
That resolves under Nuxt and fails under plain vitest, which loads the
module directly — six tests died with `ReferenceError` on the first full
run. Now imported explicitly with a comment; Nitro resolves the relative
path the same way. Worth remembering for tickets 02–03: **anything a unit
test loads must import its dependencies explicitly**, auto-imports are not
available there.
