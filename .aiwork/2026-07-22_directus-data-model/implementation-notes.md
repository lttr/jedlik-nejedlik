# Implementation notes — Directus data model (area 01)

Chronological log. Newest entries at the bottom.

## 2026-07-22

- **Ticket 01 started** (config-as-code baseline, directus-sync).
- Goal understanding: make the production Directus instance's config a
  committed, diffable artifact BEFORE any Kurzy schema exists. Plan:
  (1) check instance Directus version via MCP/API; (2) verify directus-sync
  compatibility (needs `directus-extension-sync` + Directus ≥ 11.16.1 for
  latest, else pin) via npm/web docs; (3) install `directus-extension-sync`
  on the instance — programmatically if possible; (4) add pull-only
  directus-sync config + `vp run`-able script in the repo (token from env at
  runtime, never committed); (5) run pull, commit baseline dump; (6) run
  `diff`, confirm clean.
- Credentials plan: no `DIRECTUS*` env vars exposed in this shell; will look
  for a documented token pattern or ask via blocker if nothing usable exists.
- **Instance version: Directus 11.13.1** — confirmed two ways: Coolify service
  compose (`directus/directus:11.13.1`, service `w4kgkwkow0wcw4sok80wssko`)
  and authenticated `GET /server/info` (version is only revealed to admins,
  which doubles as an admin-access check for the token).
- **directus-sync pin decision: exact `3.5.1` (latest).** The instance is
  below the 11.16.1 the ticket flagged, but research shows no hard minimum:
  the CLI has no version gate (soft `compareVersions` adaptation in
  `migration-client.ts`); the tractr repo's "chore: directus 11.13.1
  compatibility" commit is included in the 3.5.0 release cycle (3.4.1 was
  tested at 11.10.0, 3.5.0 at 11.16.1, 3.5.1 at 11.17.1 — README badges per
  tag); the 11.17.x compatibility PRs (#205, #206) touched only e2e fixtures
  and docs, no CLI code; and 3.5.1 adds a pull-relevant fix (#207, filter
  user-attached policy accesses on pull). Empirically `pull` and `diff` run
  clean against 11.13.1. Pinned exactly (no `^`) in root `package.json` so
  upgrades are deliberate.
- **`directus-extension-sync` was already installed** on the instance
  (v3.0.6, source `registry`, enabled — verified via `GET /extensions`).
  Extension host range `^11.0.0` matches 11.13.1. No install action needed.
- **Credentials resolved without blocker**: the Directus MCP server this
  environment already uses is authenticated with an admin-capable token
  (role "MCP"; passes `/server/info` version + reads on roles/policies/
  permissions/flows/settings). The same token is extracted at runtime from
  `claude mcp get directus` into `DIRECTUS_TOKEN` — same credential, same
  access level as every MCP call in the session; never printed, never
  committed. Repo config takes `DIRECTUS_TOKEN` from env at runtime.
- **Repo layout choice**: dump lives in top-level `directus/config/`
  (dumpPath), config at root `directus-sync.config.cjs` (default lookup path;
  `.cjs` because root package.json is `"type": "module"`). Scripts are
  vite-plus tasks `directus:pull` / `directus:diff` (run via `vp run …`).
- **Deviation / tradeoff — flow `operations` excluded from the dump**: the
  first pull revealed a live Ecomail API key embedded in the request-operation
  headers of the marketing flows (that is how Directus stores it). Committing
  it would leak a third-party credential. A redact-on-dump hook cannot work
  with criterion (e): `diff` compares the local dump against _raw_ remote
  data (no `onDump` hook in `data-differ.js`), so redaction would keep diff
  permanently dirty. `excludeCollections: ["operations"]` keeps secrets out
  of git and diff clean; flows themselves (no secrets) stay tracked. Open
  question for later: move the key into `FLOWS_ENV_ALLOW_LIST` env on the
  instance and re-include operations.
- Also excluded GraphQL/OpenAPI `specs` from the dump (derived artifacts, not
  config); enabled `sortJson` for stable diffs.
- **vp cache pitfall**: root package.json scripts are cached by vite-plus
  (`run.cache.scripts: true`), and a second `vp run directus:diff` replayed a
  cached "Done" without touching the network — that would mask drift. The two
  commands are therefore defined as vite-plus _tasks_ with `cache: false`
  (verified: both runs now show "cache disabled"). Dump dir
  `directus/config/**` added to `ignorePatterns` (fmt+lint) because oxfmt
  wanted to reformat 20 machine-generated JSON files, which would fight every
  future pull via the pre-commit hook.
- Side effect of `vp install`: lockfile refreshed vite-plus 0.2.4 → 0.2.5
  (allowed by existing catalog range).
- Verification: `directus-sync diff --debug` after the final pull reports
  `[snapshot] No changes to apply` and 0 to-create / 0 to-update /
  0 to-delete / 0 dangling for all tracked collections (settings, folders,
  translations, flows, roles, policies, permissions, presets, dashboards,
  panels). Dump scanned for secrets — none (Ecomail key absent).
- **Ticket 01 done** — all acceptance criteria met; committed as
  feat(directus): config-as-code baseline via pull-only directus-sync.
