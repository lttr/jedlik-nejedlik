---
status: ready
blocked_by: [05]
references:
  - "Spec: ../spec.md"
  - "Origin: ../implementation-notes.md (2026-08-19, Ticket 05 — probe suite)"
---

# 06 — Scope author uploads to the materials folder

**What to build:** constrain the Autor policy's `directus_files` **create**
permission so an author's upload can only land in **Materiály kurzů**. This
is a permissions change, which is why ticket 05 left it alone.

## The problem

The create permission is entirely unconstrained — verified live on
permission id 96 of policy `67bf15ab-…` (Autor):

```json
{ "action": "create", "fields": ["*"], "presets": null,
  "permissions": {}, "validation": null }
```

`storage_default_folder` is `null`, so nothing steers the upload either.
Read and delete, meanwhile, *are* folder-scoped. That combination is a trap:

1. The author uploads without picking a folder → the file lands at root.
2. The folder-scoped **read** rule means they cannot read the row back, so
   Directus answers **204 with an empty body** and they never see the id.
3. The folder-scoped **delete** rule means they cannot remove it either.

The author has created a file they can neither see nor clean up. This is not
theoretical: four orphaned `test-autor-probe-stray.txt` files had
accumulated on the instance and had to be deleted by hand during ticket 05.
It is also why the FP-11 checklist has to instruct the author to pick
**Materiály kurzů** by hand on every upload — friction a preset removes.

## Design

Pin the folder on the Autor policy's create permission:

- `presets: { "folder": "6173b74f-9990-41a2-b931-ff591ee6a5ed" }` so an
  upload with no folder chosen lands in the right place.
- `validation` rejecting any other folder, so an explicitly-chosen foreign
  folder is a 403 rather than an invisible orphan.

Scope this to the Autor policy only. Do **not** reach for
`storage_default_folder` — it is global and would redirect admin/marketing
uploads too.

## Investigate before committing to the shape

1. **Does Directus 11.13.1 apply permission `presets` and `validation` to
   multipart `POST /files` uploads at all?** Uploads take a different path
   from a normal item create. If `validation` is not honoured there, the
   preset alone still fixes the default case, and the fallback for the
   explicit case is a narrowing `permissions` filter. Verify empirically
   against the instance, do not assume.
2. **Exact UUID vs. subfolders.** The read/update/delete rules already allow
   the materials folder *plus one level of children*. Today that is moot —
   **Materiály kurzů** has no subfolders and the Autor policy has no
   `create` on `directus_folders`, so an author cannot make one. A bare
   `_eq` on the UUID therefore works now but silently blocks uploads the
   moment an admin adds a subfolder. Decide between matching the existing
   rules' shape and documenting the `_eq` limitation. Relational traversal
   (`folder.parent.name`) in validation on create is the part to verify —
   on create the payload holds a raw UUID.

## Acceptance criteria

- [ ] Author upload with no folder chosen lands in **Materiály kurzů**
- [ ] Author upload naming a foreign folder is refused, not silently
      orphaned outside their reach
- [ ] Admin and marketing uploads unaffected (no `storage_default_folder`
      change)
- [ ] New probes in `author.probe.ts` covering both paths above; existing
      out-of-folder probe updated or retired as the new rule dictates
- [ ] Full probe suite green (currently 61/61)
- [ ] FP-11 checklist step 4 in `../implementation-notes.md` updated — the
      author no longer needs to pick the folder by hand
- [ ] directus-sync `pull` re-run, dump diff-clean, changes committed
- [ ] Merged to master, Coolify deploy green

## Out of scope

- The Autor policy's folder rules matching by folder **name**
  (`"Materiály kurzů"`) rather than UUID — a real fragility (rename the
  folder and the rules silently stop matching), but a separate change with
  its own blast radius. Recorded in ticket 05's "Deliberately not done".
- Area 09's ingestion service, which will hold the Cloudflare token and
  route uploads by MIME type. This ticket is about the admin-app path the
  author uses today.
