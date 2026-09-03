# Implementation notes

Two scope items are outside the repo and still open — the spec is
`in-progress`, not `done`, until a human closes them:

- **Directus `org_name`** (scope item 2) — still `Jedlik Nejedlik` on the live
  instance. Set it in the admin app (Settings → Project), then
  `DIRECTUS_TOKEN=<admin-token> vp run directus:pull` so
  `directus/config/collections/settings.json` follows. Not done here: the
  Directus MCP server refuses core collections (`directus_settings` →
  "Cannot provide a core collection"), and a direct API `PATCH /settings` was
  blocked by the sandbox permission classifier.
- **Ecomail sender name** (scope item 3) — manual by design, per campaign
  under Nastavení → Jméno odesílatele.

`ContactsCard` and `LecturesSection` (two of the five copy fixes) have no live
surface: `pages/(homepage)/index.vue` has `<ContactsSection />` and
`<LecturesSection />` commented out, so both render only on `/style`. They were
verified there. `/kontakt` already carried `Jedlík-nejedlík, z. s.` before this
change.
