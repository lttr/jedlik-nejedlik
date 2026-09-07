# Implementation notes

One scope item is outside the repo and still open — the spec is `in-progress`,
not `done`, until it closes:

- **Directus `org_name`** (scope item 2) — **still open; premise now
  confirmed.** A live `GET /settings` (admin token from `web/.env`) on
  2026-09-04 returns `"org_name": "Jedlik Nejedlik"`, matching the committed
  dump (`directus/config/collections/settings.json:60`). It is a real core
  column on `directus_settings`, not a stale dump artifact.
  The spec's instruction to set it in the admin app is wrong: `org_name` is
  not exposed anywhere in Settings → Project (it is captured at project
  onboarding), so the only way to change it is `PATCH /settings` with an admin
  token, followed by `DIRECTUS_TOKEN=<admin-token> vp run directus:pull`.
  It is referenced by no app code and has no user-facing surface.
- **Ecomail sender name** (scope item 3) — **done by hand** by the repo owner
  (per campaign, Nastavení → Jméno odesílatele).

Unrelated drift found in the same read, to fold into whichever pull happens
next: live `project_descriptor` is `Výživa a výchova v propojení`, the dump
says `Jídlo je radost`.

`ContactsCard` and `LecturesSection` (two of the five copy fixes) have no live
surface: `pages/(homepage)/index.vue` has `<ContactsSection />` and
`<LecturesSection />` commented out, so both render only on `/style`. They were
verified there. `/kontakt` already carried `Jedlík-nejedlík, z. s.` before this
change.
