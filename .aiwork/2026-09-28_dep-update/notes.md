# Dependency update — 2026-W40

## Scan

`dep-scan.mjs`: 11 outdated rows, 7 in scope, 4 out of scope (exact pins /
catalog alias), 4 majors among the in-scope rows.

GitHub was unreachable for release notes this run — the session's GitHub access
is scoped to `lttr/jedlik-nejedlik`, so `api.github.com` and
`raw.githubusercontent.com` refuse every other repo. Evidence came from the npm
registry (reachable directly) and vendor doc sites instead: published manifests
for `engines`/`peerDependencies`, and package tarballs diffed by hand for the
two majors below. That turned out to be stronger evidence than release notes,
not weaker.

## Bumped (batch)

- `@directus/sdk` 25.0.1 → 26.0.0 (major) — **types-only major**. Diffed both
  tarballs: `dist/index.js` is byte-identical between 25.0.1 and 26.0.0 (0-line
  diff), and the export list is 541 names in both. The whole major is four
  type-level utility exports: `ToTuple` and `TupleToUnion` removed,
  `CollectionName` and `StringLiteralUnion` added. `rg` for both removed names
  across `web/`, `directus/` and `scripts/` found zero usages.
- `fallow` 3.27.0 → 3.30.0 (minor) — no rule-set change: `issue-registry.json`
  holds the same 3 issue ids before and after. The diff is three new opt-in CLI
  flags (`--deprecated-exports-in-use`, `--eager-only`, `--entry-weight`) plus
  help-text wording, so `check:fallow` behaviour is unchanged by default.
- `@types/node` 26.6.2 → 26.6.3 (patch) — type-only.
- `eslint-plugin-baseline-js` 0.7.1 → 0.7.2 (patch) — `peerDependencies`
  (`eslint >=9.29.0 <11`) and `engines` unchanged.

`pnpm dedupe` ran after the bumps: the re-resolve had floated a transitive
`rollup` to 4.63.5 while 4.63.4 stayed in the tree, leaving two 4.x copies.
Dedupe collapsed them to 4.63.5 alone (-54 packages).

No code changes were needed, so there is no second commit.

## Deferred

- `@sentry/nuxt` 10.75.0 → 11.0.0 (major) — **queued, needs its own run.** It
  is the one in-scope major that requires a code change, and the skill allows
  one PR per run, so the safe batch took the slot. What a v11 run has to do:
  delete `enableLogs: true` from `web/sentry.client.config.ts` and
  `web/sentry.server.config.ts`. v11 removed the option outright (it is absent
  from `CoreOptions`, which has no index signature, so the object literal in
  `Sentry.init({...})` would fail typecheck on an excess property). Deleting it
  is behaviour-preserving: logs have been on by default since 10.71.0.
  Everything else checked out clean — every other documented v11 breaking item
  was searched across the source and found absent (`Scope.clear`,
  `skipOpenTelemetrySetup`, `setup*ErrorHandler`, `@sentry/types`,
  `@sentry/node-core`, the `init`/`preload`/`loader` entrypoints,
  `beforeSendTransaction`, `ignoreTransactions`, `beforeSendSpan`,
  `enableInteractions`, `ignorePerformanceApiSpans`,
  `trackFetchStreamPerformance`, `otlpIntegration`, `inboundFiltersIntegration`,
  `childProcessIntegration`, `sourceMapsUploadOptions`,
  `autoInjectServerSentry`, `experimental_entrypointWrappedFunctions`,
  `--import` in any start command). The repo is already on v11's config shape:
  `dataCollection` instead of `sendDefaultPii`, `sentry.server.config.ts` in
  `web/` rather than `public/instrument.server.ts`, and a flattened
  `sourcemaps: { disable: true }`.
  The v11 PII default flip does **not** affect us: `dataCollection` is set
  explicitly in both config files, and every key we set still exists in v11's
  `DataCollection` interface. It is also honoured today — v10.75.0 already
  ships `dataCollection` and `defaultPiiToCollectionOptions`, so this config is
  live on the current version, not inert. One new v11 key we do not set,
  `queues`, defaults to `true`.
  Engines are satisfied: v11 needs Node `>=20.19.0 <22 || >=22.12 <23 || >=23.2`;
  local is 22.22.2 and `nixpacks.toml` deploys on Node 24.
  What the reviewer has to accept is not code but monitoring behaviour: span
  streaming is on by default and transactions no longer exist, span names go
  low-cardinality, span ops and attributes are renamed to semantic
  conventions, Safari 14 drops out of support, `captureMessage` and non-Error
  captures gain synthetic stack traces, and browser session `lifecycle`
  defaults to `'page'`. Saved dashboards and alerts in the Sentry project may
  need rebuilding. That is a judgement call deserving its own PR.
- `@nuxt/devtools` 3.4.2 → 4.0.0-beta.2 — npm's `latest` dist-tag still points
  at a prerelease; the highest stable is 3.4.2, which is what we run, so there
  is nothing to bump. Beyond the beta, 4.0.0-beta.2 peers `nitro ^3.0.0-0` and
  `vite ^8.1.5` while we are on nitropack 2.x, and the Nuxt group is
  indivisible with no stable update anywhere else in it.
- `typescript` 5.9.3 → 7.0.2 (major) — unchanged from last run's reasoning, and
  the manifests now show it concretely: 7.0.2 is `"type": "module"` with `main`
  dropped and the export map rebuilt around `./unstable/*`. `vue-tsc` is still
  3.3.11 (its own `latest`) peering `typescript: >=5.0.0`, a range TS 7
  satisfies on paper while the compiler API it calls has moved — exactly the
  "satisfies on paper, breaks at build time" shape. Left alone until `vue-tsc`
  declares TS 7 support. Also skips TS 6 entirely.

## Reported, not touched (out of scope)

- `h3` 1.15.11 → 2.0.1-rc.32 — exact pin, tracks `nitropack`'s resolved copy.
- `rolldown` 1.2.5 → 1.2.11 — exact pin, moves only with the four-row group.
- `vite-plus` 0.3.0 → `latest` is now 1.0.0-rc.1 (`catalog:`) — a prerelease on
  the `latest` tag. The highest stable is 0.3.3. A group move to 0.3.3 would
  keep `vitest` at 4.1.11 (0.3.3 still depends on exactly that), so only the
  two catalog rows and `rolldown` would move; the rolldown target has to be
  read from `vp toolchain` after bumping core, not guessed. Needs its own run.
- `vitest` 4.1.11 → 5.0.2 — exact pin, moves only with the four-row group.

Verified the four-row set is still internally consistent before touching
anything: `vp toolchain` reports core 0.3.0 bundling rolldown 1.2.5 and
depending on vitest 4.1.11, matching both catalog rows and both `web/`
pins. `nuxt` 4.5.2 still peers `rolldown: ~1.2.1` non-optionally, so the
`rolldown` devDep is still required.

## Hoist skew

Re-checked after the install and again after `pnpm dedupe` regenerated
`web/.nuxt/tsconfig.server.json`, since a regen can flip the hoist with nothing
in the diff to explain it. Unchanged: `h3` (majors 1/2, root hoists 1.15.11,
tsconfig `paths` point at 1.15.11 — the documented pin holding) and `ofetch`
(majors 1/2, root hoists 1.5.1, paths agree — still correct by luck of the
hoist, still unpinned).

Upstream `vite@7.3.2` is still the hoisted root copy with no importer declaring
it, pulled in by `autoInstallPeers` as a peer-resolution key; the `catalog:`
override still correctly redirects `@nuxt/vite-builder` to core 0.3.0, so the
copy that matters is right. Still undocumented in `pnpm-workspace.yaml`.
`typescript@7.0.2` now also appears in the tree the same way, as a
peer-resolution key inside `vite-plus`'s lockfile entry, with no importer on it.

## DELETE-WHEN status

- `overrides.vite` / `peerDependencyRules` ("Nuxt ships vite-plus compat") —
  not satisfied. Nuxt 4.5.2 is unchanged this run and `@nuxt/vite-builder`
  still declares upstream `vite` as a direct dependency.
- `web/package.json` `h3` exact pin ("no second h3 major installed, or Nitro 3
  / h3 v2 lands") — not satisfied; both majors 1 and 2 are still installed.

## Outcome

✅ `vp run check:all` green (18 test files, 145 tests; 392 files formatted; no
warnings, lint errors or type errors in 246 files). Batch bump only, no
migration PR this run.

✅ `vp run build` green as well, run after the PR was opened. The build is not
one of the checks — it runs on deploy — and a dependency bump can break it while
`check:all` stays clean, so it is worth running on a deps PR. The Nitro output
builds completely on these versions.

✅ The Coolify preview deployment went green and published a preview URL
(`https://test-29.jedlik-nejedlik.cz`), which made the two gaps this skill
normally has to report as unverifiable actually testable. Both were closed
against that deployment, which runs the dependency-bump code with real env vars
against the real CMS:

- **Runtime against live Directus.** `/api/courses` returns a real course
  record through `@directus/sdk` 26.0.0 with its nested `cover` relation
  intact, and `/api/courses/<slug>` resolves the three-level nested query
  (course → sections → lessons, sorted). `/kurzy` and `/kurzy/<slug>` render
  that data in the SSR HTML — section and lesson headings included. All of
  `/`, `/o-nas`, `/kurzy`, `/pro-rodice`, `/podcast` return 200 with no error
  markers.
- **Visual rendering.** Screenshotted `/kurzy` and the course detail page at
  375px and `/kurzy` at 1366px with the pre-installed Chromium, and looked at
  the images. Layout is correct at both widths: no horizontal overflow at
  375px, the nav wraps as intended, the course card and cover render, the
  consent banner sits correctly, and Czech typography (the `jedlík–nejedlík`
  en dash, diacritics) is intact.

Getting a browser onto the preview needed the agent proxy's interception CA in
the NSS trust store — `~/.pki/nssdb` and `certutil` are both absent from this
image, so Chromium failed every load with `ERR_CERT_AUTHORITY_INVALID` until
`libnss3-tools` was installed and both certs from `/root/.ccr/agent-proxy-ca.crt`
were imported. Worth writing down: the environment claims the browser NSS store
is pre-configured, and here it was not. TLS verification was never disabled.

Still not reached: no `web/.env` exists in this session, so nothing ran against
Directus _locally_ — the CMS evidence above is all from the deployed preview.

## Follow-up: `@sentry/nuxt` 11 (2026-09-29, on `master`)

Bumped `@sentry/nuxt` to 11.0.0 and dropped `enableLogs: true` from both
Sentry configs, as planned above. 11.1.0 is already out but still inside
`minimumReleaseAge`: pnpm offered to add 14 `minimumReleaseAgeExclude` rows,
so it was left for the next run. `check:all` and `vp run build` are green; the
dev server renders `/`, `/kurzy`, `/o-nas` and `/api/courses`, and the browser
client reports `sentry.javascript.nuxt/11.0.0` with no console errors.
