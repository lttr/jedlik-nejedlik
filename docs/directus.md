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

The instance intermittently answers `503 no available server` under rapid
requests — retry before concluding anything is broken.

## Finding a permission rule

Read rules from the dump: `directus/config/collections/permissions.json` holds
every rule as JSON, one object per policy × collection × action — the same data
the admin app edits, without poking the live API.

**The dump does not carry live ids.** Records are keyed by `_syncId`, a
directus-sync identity that is stable across instances but is _not_ the id the
API uses. Look ids up live (by name or other attributes) before issuing a
`PATCH`.

In the admin app the same rule lives at **Settings → Access Policies →**
_policy_ **→ permissions matrix → click the action cell**. Only the first
editor section is shown by default — the rest are easy to miss:

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

The Autor policy is scoped to the **Materiály kurzů** folder, so an author
cannot reach marketing assets:

- read / update / delete match the folder **by name**, plus one level of
  subfolders
- create carries a preset and a validation pinning uploads to that folder **by
  UUID**, so an upload with no folder chosen lands there and a foreign folder is
  refused with `400 FAILED_VALIDATION`

The name-vs-UUID split is deliberate but inconsistent: renaming the folder
breaks the first three rules and not the fourth, and an admin adding a subfolder
would allow reads there while blocking uploads.

## Permission probes

`web/tests/probes/` holds on-demand tests that assert what each role can
actually do against the production instance — externally observable access
behaviour, never Directus internals. They are deliberately excluded from the
default test run.

```bash
vp run directus:probe   # from the repo root
```

Tokens live in `web/.env` (gitignored); `web/vitest.probes.config.ts` loads it
via `process.loadEnvFile()`, and shell-set variables take precedence.

The suite is self-cleaning: it deletes everything it creates. A failed run can
leave rows behind, which the next run's admin sweep removes.

### Tokens

Four environment variables, values never committed:
`DIRECTUS_PROBE_AUTHOR_TOKEN`, `DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN`,
`DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN`, `DIRECTUS_PROBE_ADMIN_TOKEN` (the
admin one is only for fixtures and cleanup — reuse the MCP credential,
`claude mcp get directus` prints it).

The three role tokens are the static access tokens of the fixture probe users
below — each variable maps to the user with the matching email. To obtain one:

- **Admin app**: **User Directory →** _probe user_ **→ Token** — click the
  generate icon, save the user, and copy the value into `web/.env`.
- **API**: `PATCH /users/<id>` with a fresh random `token` (e.g. from
  `openssl rand -hex 32`), authorized with the admin token. Look the user id up
  live by email first, or take it from `web/tests/probes/support.ts`.

Directus masks static tokens on read, so a lost token cannot be recovered —
repeat either step above to rotate it, then update `web/.env`. Rotating
replaces the old token immediately; there is no overlap window.

### Fixtures — do not delete

Stable `[TEST]`-marked rows the probes depend on (current ids are pinned in
`web/tests/probes/support.ts`):

- three probe users: `probe-author@jedlik-nejedlik.cz` (Autor),
  `probe-student-entitled@…` and `probe-student-unentitled@…` (Student)
- one published `[TEST]` course, plus the entitlement linking it to the
  entitled student

The unentitled student must stay **unentitled** — granting them a course breaks
the student probes, which is exactly what happened after the FP-11 walkthrough.
