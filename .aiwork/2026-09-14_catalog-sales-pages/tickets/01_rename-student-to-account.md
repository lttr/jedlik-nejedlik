---
status: ready
blocked_by: []
references:
  - "Spec: ../spec.md"
  - "ADR 0002: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 01 — Rename the auth session concept Student → Account

**What to build:** the auth layer's session plumbing speaks Account instead of Student, because an Author previewing a draft holds the same session and the glossary reserves Student for the learner and buyer. The type, the composable, the session store helpers and the Directus client helpers (including the one the read path of area 03 will call) move to Account naming. Middleware names stay. Directus columns keep `student`, since Orders, Entitlements and Progress do belong to Students. Login, logout, registration, password reset and the account page behave exactly as before.

Also applies the two corrections to the epic's `areas.md` entry for area 03: it depends on 00, 01 **and 02**, and its one-line description says only the hard facts come from Directus.

## Acceptance criteria

- [ ] No identifier in the auth layer names the session or its holder "Student"; comments explaining the rename cite the glossary
- [ ] Directus column names and glossary uses of Student (learner, buyer) are untouched
- [ ] The existing auth probe and unit tests pass with their meaning unchanged
- [ ] Register → login → account page → logout still works in the running app
- [ ] The epic's `areas.md` entry for area 03 carries both corrections
- [ ] `vp run check:all` passes
