# Implementation notes — Area 03: Catalog + Sales Pages

Short log for the maintainer: only what you have to act on or would be misled
without. Per-ticket entries appended by the orchestrator as tickets land.

## Run

- Clarity gate: the spec's Open Concerns are all deferred outside this area
  (launch-time fixture cleanup, area 04a's verification call, the unscheduled
  SimpleShop cutover). None changes what this run builds, so the run went
  ahead unattended rather than stopping for confirmation.
- The run executes in a cloud container. `web/.env` was written there from
  the container's environment (gitignored, never committed) so the probe
  config's `loadEnvFile` and `directus-sync` resolve tokens as documented.
- Parallel ticket worktrees were unusable in this harness: a subagent that
  enters a sibling worktree loses Bash and Edit. Tickets therefore ran one at
  a time in the task worktree, on the `catalog-sales-pages` branch.
- Chromium refuses to start as root with its sandbox on, which is what the
  Playwright preflight failure in a fresh cloud container was. The global
  `~/.playwright/cli.config.json` now needs `launchOptions.chromiumSandbox:
false`; `scripts/cloud-setup.sh` writes it (commit `679cc9f`).

## 01 — Rename Student → Account

- `registerStudent` keeps its name on purpose: registration creates a
  Student-role user (`public_registration_role`); Authors are made in the Data
  Studio. Everything an Account can do (password change, reset, e-mail
  verification) moved to Account naming.
- The `areas.md` corrections were already on `master` from commit `24ebb03`;
  that step was a no-op.
- `docs/adr/0002-nitro-mediated-auth-sessions.md` still uses the old names
  (`getDirectusServerClient`, "Students authenticate"); left as the historical
  record.
- The in-app pass activated the throwaway user through the admin API rather
  than the verification e-mail; the e-mail link path is covered by the auth
  probe, not by this ticket's flow.

## 02 — Directus teaser, cover folder, fixture

- **Needs the site owner:** an Author cannot use the cover picker as intended.
  The Autor policy's `directus_files` create rule pins uploads to „Materiály
  kurzů" by UUID and its read rule covers only that folder, so an Author can
  neither upload into nor browse `Public/kurzy`. Today a cover has to be
  uploaded by an admin or Redaktor. Widening the Autor policy is a
  production permission change; decide whether Authors get read + create on
  `Public/kurzy` (`directus/config/collections/permissions.json`, Autor rows).
- No Public-policy change was needed: its files read rule already matches
  `folder.parent.name icontains "Public"`, which covers the new child folder.
- The new fixture lessons carry a placeholder `body` beyond the ticket's
  wording, because `student-scoping.probe.ts` asserts every lesson of course 1
  has a string body. `video_uid` is nullable, so no placeholder video exists.
- The fixture cover is a generated 1200×675 gradient PNG, not a photo. The
  `[TEST]` course must be removed or archived before launch (spec, Open
  Concerns).

## 03 — Catalog

- **Check once on a normal network:** Chromium in the cloud container cannot
  tunnel TLS through the agent proxy, so Directus covers never load in the
  headless browser there. The anonymous cover permission was proven with
  `curl` (200) and the visual pass fed the browser those same bytes via a
  Playwright route (recipe in `run-jedlik-nejedlik`, "Cloud container
  quirks"). Reload `/kurzy` once outside the container to see the cover load
  natively.
- The status filter is `_in: ["published", "draft"]`, not `published` alone:
  Directus's own policy decides who gets drafts (ADR 0004), and the explicit
  list keeps any future status (archived) out. `status` rides in the payload
  for the „Koncept" badge (ticket 05).
- Directus is asked for `sort: ["sort", "id"]`; Postgres puts nulls last on
  ascending sort, which matches `compareCatalogOrder`, but the comparator is
  still applied server-side so the order does not rest on a database default.
- `CourseCollection.sections` and `SectionCollection.lessons` in the directus
  layer were widened to accept nested objects, so the SDK types the
  `sections.lessons.id` selection used for the lesson count.
- The desktop grid uses `auto-fill` rather than puleo's `auto-fit`, so a lone
  course keeps its column width instead of stretching across the row.

## 04 — Sales Page

- The purchase button is a static link to `/objednavka/<slug>`, the order
  route area 04a will own. Until 04a lands the route does not exist, so the
  dev console logs a Vue Router "No match found" warning on the Sales Page.
  Expected, not a defect.
- The site has no `app/error.vue`, so "the site's normal 404" is Nuxt's
  default English error page. The Sales Page throws the same
  `createError({ statusCode: 404, fatal: true })` shape as a route miss, so
  `/kurzy/neexistuje` and `/kurzy/test-kurz-draft` are word-for-word the same
  as `/neexistuje`. A branded Czech 404 would be a separate `error.vue` task
  and this page would pick it up automatically.
- Outline order is applied server-side by the codec (`parseSalesCourse` runs
  `compareCatalogOrder` on sections and lessons), not by Directus deep sort;
  covered by `web/tests/unit/sales.test.ts`.
- The `["published", "draft"]` status list lives once in
  `web/layers/shop/server/utils/shop-statuses.ts` so both routes filter
  identically.

## 06 — Bespoke content registry

- Registry entries are `defineAsyncComponent` imports, so each Course's copy
  is its own chunk and the registry loads in plain vitest. The map is
  module-private and the lookup takes it as a defaulted parameter, so the unit
  test does not pin the real fixture key: removing the `[TEST]` Course at
  launch breaks no test, only the dev warning fires until its entry in
  `web/layers/shop/app/utils/sales-content.ts` is deleted too.
- The dev warning runs on the Catalog page, where every slug is known
  without an extra request. It fires twice per load in dev (server render and
  hydration); intentional.
- `vp run build` cannot finish in the cloud container (`@nuxt/fonts` download
  fails on the proxy's certificate) after the bundles are written. The
  tree-shaking evidence for the warning came from those bundles; the built
  site was not run here. Coolify builds on a normal network.

## 07 — Metadata, structured data, sitemap

- **For a human:** run the published Sales Page through Google's Rich
  Results Test once it is live; the container could only validate the JSON-LD
  offline (parse and shape assertions, all passed).
- **Decide:** sitemap entries carry no `lastmod`, because the Public policy's
  `course` read fields exclude `date_updated`. Exposing it is a production
  permission change.
- No schema.org identity is configured site-wide, so the Course `provider`
  is an Organization built from `site.name` and `site.url` on the page.
  Setting `schemaOrg.identity` in `nuxt.config.ts` would take over
  automatically.
- The og:image URL is hand-built in `web/layers/shop/shared/utils/og-image.ts`
  rather than via `$img()`: the `@nuxt/image` Directus provider bakes the
  Directus URL in at build time, while the page reads the runtime config, and
  the two could diverge.
- The bundled Offer resolver adds `priceValidUntil` (end of next year) and
  defaults `availability` to InStock; accepted.
- `sitemap.sources` is declared in the shop layer's `nuxt.config.ts`; defu
  concatenates it with the root config.
