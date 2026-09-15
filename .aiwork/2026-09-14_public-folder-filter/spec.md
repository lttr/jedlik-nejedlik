---
status: not-started
verified: []
references:
  - "Found by: /code-review on ../2026-09-14_catalog-sales-pages (area 03)"
  - "Directus workflow: ../../docs/directus.md (config as code is pull-only)"
  - "Rules: ../../directus/config/collections/permissions.json"
---

# Match the public file folders by id, not by the substring "Public"

## Problem

Three `directus_files` **read** rules decide which uploaded files a visitor may
fetch. All three carry the same filter, matching the folder **by name
substring**:

```json
{
  "_or": [
    { "folder": { "parent": { "name": { "_icontains": "Public" } } } },
    { "folder": { "name": { "_icontains": "Public" } } }
  ]
}
```

| `_syncId`   | Policy  | Added                          |
| ----------- | ------- | ------------------------------ |
| `fd5f87d9…` | Public  | pre-existing                   |
| `cc586c3a…` | Student | area 03, ticket 05 (`9a84fc2`) |
| `31f50dda…` | Autor   | area 03, ticket 05 (`9a84fc2`) |

`_icontains` matches any folder whose name merely _contains_ the word: a future
`Republikace`, `non-public` or `Publications` folder at the root, or under one,
silently becomes world-readable with `fields: ["*"]` — to anonymous visitors
first of all, since the Public policy carries the same rule. Nobody creating
that folder in the admin app gets any signal that they just published it.

The grant is correct today; only the spelling is fragile. Today's folder tree:

```
Public/  532bfb77-87fb-46c5-94e7-addfb04e79a0
  ├── kurzy          59ffe3f9-4f57-44c4-8b01-2f019979d425
  ├── ebook-cukrovi
  ├── média
  ├── lidé
  ├── přednášky
  └── dokumenty
Materiály kurzů/  (private, separate rules)
```

## Scope

Replace the name-substring match in **all three** rules with an identity match
on the `Public` folder's id, keeping the two-level depth the rules have now:

```json
{
  "_or": [
    { "folder": { "_eq": "532bfb77-87fb-46c5-94e7-addfb04e79a0" } },
    { "folder": { "parent": { "_eq": "532bfb77-87fb-46c5-94e7-addfb04e79a0" } } }
  ]
}
```

This is the same shape the area's create/update/delete rules already use, which
pin `Public/kurzy` by UUID (`59ffe3f9…`).

**Do not narrow the read rules to `Public/kurzy`.** The whole `Public` tree is
meant to be readable — `ebook-cukrovi`, `média`, `lidé`, `přednášky` and
`dokumenty` all serve files to the live site. Pinning the reads to the course
folder would break them. The fix is about _how_ the folder is identified, not
_which_ folders are covered.

Keep the depth as-is: a file in a grandchild such as `Public/kurzy/2026` is not
readable today and stays that way. Deepening the rule is a separate decision.

Out of scope: the `Materiály kurzů` rules (already exact-name matches, private
folder), the `fields: ["*"]` breadth of the read rules, and any change to which
roles hold the rules.

## How to apply

Config as code here is **pull-only** — edit in the admin app, then dump:

1. **Settings → Access Policies →** _Public_ / _Student_ / _Autor_ **→
   permissions matrix → `directus_files` read cell → Item Permissions**, and
   replace the filter in each.
2. `vp run directus:pull`, and confirm the diff touches only these three
   records in `permissions.json`.

Verify the id before saving: `532bfb77-…` comes from the committed
`folders.json`, where records key on `_syncId` rather than the live id. The
sibling id `59ffe3f9-…` _is_ live — ticket 02 read it back from
`GET /fields/course/cover` — so the two very likely coincide, but confirm
`Public`'s live id (admin app URL, or `GET /folders?filter[name][_eq]=Public`)
rather than trusting the dump.

## Verification

- `vp run directus:diff` clean after the pull.
- `web/tests/probes/author.probe.ts` and `web/tests/probes/author-preview.probe.ts`
  pass: an Author still round-trips a cover in `Public/kurzy`, and Author,
  Student and anonymous each still read the published cover through the shop
  routes' `cover.{id,width,height,description}` selection.
- `web/tests/probes/public-cover.probe.ts` passes: the `Public/kurzy` file is
  fetchable without a token, the materials file is not.
- New assertion: a file in a second `Public` child (an existing one, e.g.
  `média`) is still anonymously readable — the regression this change risks.
- Negative check for the actual fix: create a throwaway root folder named
  `Republikace`, upload a file, confirm an anonymous `GET /assets/<id>` answers
  403, then delete both. Before the change the same check returns 200.
- `vp run check:all` green.
