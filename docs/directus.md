# Working with Directus

Operational notes for the CMS at `https://obsah-jedlika.lttr.cz`. Why Directus
owns both content and transactional data is [ADR 0001](adr/0001-directus-system-of-record.md);
how the site authenticates against it is [ADR 0002](adr/0002-nitro-mediated-auth-sessions.md).
This page is the _how_, not the _why_.

## Admin app and MCP

Admin app: <https://obsah-jedlika.lttr.cz/admin>.

Directus also exposes a [Model Context Protocol](https://directus.io/docs/guides/ai/mcp)
endpoint for AI-assisted content management. To wire it into Claude Code:

```bash
claude mcp add --transport http directus <directus-url>/mcp \
  --header "Authorization: Bearer <your-mcp-user-token>"
```

The same credential doubles as the admin token for the commands below —
extract it with `claude mcp get directus` rather than minting a second one.

## Config as code (pull-only)

The instance's configuration (roles, policies, permissions, flows, settings, …)
and the schema snapshot are committed under `directus/config/`, dumped with
[directus-sync](https://github.com/tractr/directus-sync) (config in
`directus-sync.config.cjs`; requires the `directus-extension-sync` extension on
the instance):

```bash
DIRECTUS_TOKEN=<admin-token> vp run directus:pull   # refresh the committed dump
DIRECTUS_TOKEN=<admin-token> vp run directus:diff   # detect drift against the dump
```

The workflow is **pull-only**: Directus is configured in its admin app and
changes are pulled into the repo as reviewable diffs — the dump is never pushed
back. Flow `operations` are excluded because they embed third-party API keys
(see the note in `directus-sync.config.cjs`).

The instance answers `503 no available server` now and then under rapid
requests. Retry before concluding anything is broken.

## Finding a permission rule

Reading is fastest from the dump: `directus/config/collections/permissions.json`
holds every rule as JSON, one object per policy × collection × action. That
beats poking the live API, and it is the same data the admin app edits.

**The dump does not carry live ids.** Records are keyed by `_syncId`, a
directus-sync identity that is stable across instances but is _not_ the id the
API uses. The Autor policy is `d15b2dbf-…` in the dump and
`67bf15ab-fa2c-4d33-8961-ea4337cc4446` on the instance. Look ids up live before
issuing a `PATCH`.

In the admin app the same rule lives at **Settings → Access Policies →**
_policy_ **→ permissions matrix → click the action cell**. The editor splits
into sections that are easy to miss, because only the first is shown by
default:

| Section           | Field in the dump | What it does                                  |
| ----------------- | ----------------- | --------------------------------------------- |
| Item Permissions  | `permissions`     | Which rows the action may touch               |
| Field Permissions | `fields`          | Which columns may be read or written          |
| Field Validation  | `validation`      | Rejects a payload that fails the filter       |
| Field Presets     | `presets`         | Default values merged into a create or update |

Two behaviours worth knowing before you rely on them:

- **Presets only fill gaps.** Directus merges `assign({}, ...presets, payload)`,
  so anything the client actually sent wins. A preset can never override a
  user's choice.
- **Validation on create sees a flat payload, not the database.** It runs
  through `validatePayload`, a static check on the submitted object. Relational
  filters such as `folder.parent.name` do not resolve there — on create the
  payload holds a raw UUID.

## Roles and file scoping

Policies: Administrator, Redaktor, **Autor** (course authoring), **Student**
(paid content), and Public.

The Autor policy is scoped to the **Materiály kurzů** folder
(`6173b74f-9990-41a2-b931-ff591ee6a5ed`), so an author cannot reach marketing
assets:

- read / update / delete match the folder **by name**, plus one level of
  subfolders
- create carries a preset and a validation pinning uploads to that folder **by
  UUID**, so an upload with no folder chosen lands there and a foreign folder is
  refused with `400 FAILED_VALIDATION`

The name-vs-UUID split is deliberate but inconsistent: renaming the folder
breaks the first three rules and not the fourth, and an admin adding a subfolder
would allow reads there while blocking uploads. Background in
`.aiwork/2026-07-22_directus-data-model/implementation-notes.md` (tickets 05
and 06).

## Permission probes

`web/tests/probes/` holds on-demand tests that assert what each role can
actually do against the production instance — externally observable access
behaviour, never Directus internals. They are deliberately excluded from the
default test run.

```bash
set -a; . web/.env; set +a   # tokens live here, gitignored
vp run directus:probe
```

The suite is self-cleaning: it deletes everything it creates. A failed run can
leave rows behind, which the next run's admin sweep removes.

### Tokens

Four environment variables, values never committed:
`DIRECTUS_PROBE_AUTHOR_TOKEN`, `DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN`,
`DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN`, `DIRECTUS_PROBE_ADMIN_TOKEN` (the
admin one is only for fixtures and cleanup — reuse the MCP credential).

Directus masks static tokens on read, so a lost token cannot be recovered, only
replaced. To rotate, `PATCH /users/<id>` with a fresh random `token` using the
admin token, then persist the new values so the next session need not repeat it.

### Fixtures — do not delete

Stable `[TEST]`-marked rows the probes depend on:

| Fixture                                   | Id                                     |
| ----------------------------------------- | -------------------------------------- |
| `probe-author@jedlik-nejedlik.cz` (Autor) | `67f8098f-2852-465d-bd9c-8738565dd740` |
| `probe-student-entitled@…` (Student)      | `42ea0c6c-9e85-4ae1-a63d-336dc63a8b54` |
| `probe-student-unentitled@…` (Student)    | `70975566-e359-4d67-9bf7-81d69d5b8a79` |
| Published course                          | `1`                                    |
| Entitlement: entitled student × course 1  | `1`                                    |

The unentitled student must stay **unentitled** — granting them a course breaks
the student probes, which is exactly what happened after the FP-11 walkthrough.
