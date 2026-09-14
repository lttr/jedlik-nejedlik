---
status: done
blocked_by: []
verified: [checks, behaviour]
references:
  - "Spec: ../spec.md"
  - "ADR 0002: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 01 — Rename the auth session concept Student → Account

**What to build:** the auth layer's session plumbing speaks Account instead of Student, because an Author previewing a draft holds the same session and the glossary reserves Student for the learner and buyer. The type, the composable, the session store helpers and the Directus client helpers (including the one the read path of area 03 will call) move to Account naming. Middleware names stay. Directus columns keep `student`, since Orders, Entitlements and Progress do belong to Students. Login, logout, registration, password reset and the account page behave exactly as before.

Also applies the two corrections to the epic's `areas.md` entry for area 03: it depends on 00, 01 **and 02**, and its one-line description says only the hard facts come from Directus.

## Acceptance criteria

- [x] No identifier in the auth layer names the session or its holder "Student"; comments explaining the rename cite the glossary
- [x] Directus column names and glossary uses of Student (learner, buyer) are untouched
- [x] The existing auth probe and unit tests pass with their meaning unchanged
- [x] Register → login → account page → logout still works in the running app
- [x] The epic's `areas.md` entry for area 03 carries both corrections
- [x] `vp run check:all` passes

## Verification

- No Student session identifier: `grep -rn Student web/layers/auth` finds only the deliberate `registerStudent` (comment cites GLOSSARY.md) and comments about the Student role/policy; `useAccount`, `Account`, `AccountSecrets`, `*AccountSession`, `logInAccount`, `logOutAccount`, `*AccountDirectusClient` replace the old names.
- Directus columns and glossary uses untouched: the diff touches no `directus/` file and no `student` column; the probe still speaks of the Student role.
- Auth probe and unit tests: `web/tests/probes/auth.probe.ts` changed only in one comment (`AccountEmail`); unit tests run inside `vp run check:all`.
- Register → login → account page → logout in the running app (headless Chromium, dev server on :3000, throwaway `probe-run-<uuid>@jedlik-nejedlik.cz` activated via the admin API and deleted afterwards): `screenshots/01-registrace-submitted{,-375}.png` shows the confirmation with the address; `screenshots/02-muj-ucet{,-375}.png` shows „Jste přihlášeni jako <e-mail>" and „Můj účet" in the nav; after „Odhlásit se" the nav lost the link and `/muj-ucet` redirected to `/prihlaseni?redirect=/muj-ucet` (`screenshots/03-muj-ucet-after-logout.png`). Both widths render without clipping.
- `areas.md` corrections: already on master before this ticket (area 03 depends on 00, 01 and 02; description says only the hard facts come from Directus); nothing to change.
- `vp run check:all`: green (lint, slowlint, typecheck, fallow, test).
