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

The same credential doubles as the admin token for the commands below. Extract
it with `claude mcp get directus` rather than minting a second one.

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
changes are pulled into the repo as reviewable diffs. The dump is never pushed
back. Flow `operations` are excluded because they embed third-party API keys
(see the note in `directus-sync.config.cjs`).

The instance intermittently answers `503 no available server` under rapid
requests, so retry before concluding anything is broken.

## Finding a permission rule

Read rules from the dump: `directus/config/collections/permissions.json` holds
every rule as JSON, one object per policy × collection × action. It is the same
data the admin app edits, readable without poking the live API.

**The dump does not carry live ids.** Records are keyed by `_syncId`, a
directus-sync identity that is stable across instances but is _not_ the id the
API uses. Look ids up live (by name or other attributes) before issuing a
`PATCH`.

In the admin app the same rule lives at **Settings → Access Policies →**
_policy_ **→ permissions matrix → click the action cell**. Only the first
editor section is shown by default, and the rest are easy to miss:

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
  filters such as `folder.parent.name` do not resolve there, because on create
  the payload holds a raw UUID.

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
actually do against the production instance. They assert externally observable
access behaviour, never Directus internals. They are deliberately excluded from the
default test run.

```bash
vp run directus:probe   # from the repo root
```

Tokens live in `web/.env` (gitignored). `web/vitest.probes.config.ts` loads it
via `process.loadEnvFile()`, and shell-set variables take precedence.

The suite is self-cleaning: it deletes everything it creates. A failed run can
leave rows behind, which the next run's admin sweep removes.

### Tokens

Four environment variables, values never committed:
`DIRECTUS_PROBE_AUTHOR_TOKEN`, `DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN`,
`DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN`, `DIRECTUS_PROBE_ADMIN_TOKEN` (the
admin one is only for fixtures and cleanup: reuse the MCP credential, which
`claude mcp get directus` prints).

The three role tokens are the static access tokens of the fixture probe users
below, each variable mapping to the user with the matching email. To obtain one:

- **Admin app**: **User Directory →** _probe user_ **→ Token**. Click the
  generate icon, save the user, and copy the value into `web/.env`.
- **API**: `PATCH /users/<id>` with a fresh random `token` (e.g. from
  `openssl rand -hex 32`), authorized with the admin token. Look the user id up
  live by email first, or take it from `web/tests/probes/support.ts`.

Directus masks static tokens on read, so a lost token cannot be recovered.
Repeat either step above to rotate it, then update `web/.env`. Rotating replaces
the old token immediately, with no overlap window.

### Fixtures: do not delete

Stable `[TEST]`-marked rows the probes depend on (current ids are pinned in
`web/tests/probes/support.ts`):

- three probe users: `probe-author@jedlik-nejedlik.cz` (Autor),
  `probe-student-entitled@…` and `probe-student-unentitled@…` (Student)
- one published `[TEST]` course, plus the entitlement linking it to the
  entitled student

The unentitled student must stay **unentitled**. Granting them a course breaks
the student probes, which is what happened after the FP-11 walkthrough.

## Transactional e-mails

Directus sends the registration and password-reset mails, not the site. Its
system templates are English and Directus-branded. `directus/templates/` holds
our Czech, on-brand overrides, one per system template that can reach a site
visitor: `user-registration.liquid`, `password-reset.liquid` and
`user-invitation.liquid`.

### The From address

`EMAIL_FROM` is `info@jedlik-nejedlik.cz` and Directus renders the `From:` header
as `{project_name} <{EMAIL_FROM}>`, so mail arrives as
`Jedlík-nejedlík <info@jedlik-nejedlik.cz>`.

That address is only the visible header. The envelope sender and the DKIM `d=`
stay on `mg.jedlik-nejedlik.cz` (`EMAIL_MAILGUN_DOMAIN`), which is what keeps
transactional-send reputation off the root domain used by Google Workspace.
DMARC still passes: the root policy is `p=none` with default relaxed alignment,
so the sending subdomain counts as the same organizational domain.

Directus sets no `Reply-To`, so replies go to `EMAIL_FROM` — someone has to read
that inbox. Before 2026-09-03 it was `noreply@mg.jedlik-nejedlik.cz`, a domain
with no MX, so replies to registration mails simply bounced.

Do not debug the `From:` display name against a Firefox Relay mask: Relay
rewrites the header to `"<sender address> [via Relay]" <mask@mozmail.com>`,
discarding the display name. It looks exactly like Directus dropping the name.
Test with a non-Relay address.

The instance already mounts a volume at `/directus/templates`, Directus's
default `EMAIL_TEMPLATES_PATH`. A file dropped in there wins over the system
template of the same name (`MailService.renderTemplate`), with no env change
needed. Templates are [LiquidJS](https://liquidjs.com). The engine root also
covers the built-in directory, so `{% layout 'base' %}` still resolves, but our
override deliberately does not use it: that layout carries an English footer and
signature.

Available variables: `url` (the action link, which must appear) and `email` in
all three, plus `first_name` and `last_name` in `user-registration` only. On top
of those, `projectName`, `projectColor`, `projectLogo` and `projectUrl` come
from Directus settings.

### Deploying templates and extensions

Both are version-controlled here and pushed to the instance. This is the one
place this repo writes to Directus, in contrast to the pull-only config dump:

```bash
vp run directus:push   # needs an authenticated `coolify` CLI, no SSH
```

`scripts/directus-push.sh` mirrors every `directus/templates/*.liquid` and every
file under `directus/extensions/` (minus `node_modules/`) into a Coolify **file
storage** on the `directus` service, mounted at the matching path under
`/directus/templates/` or `/directus/extensions/`. It creates the storage on the
first run and overwrites its content afterwards. The script resolves the service
by name through the CLI, so no uuids live in the repo
(`COOLIFY_DIRECTUS_SERVICE` and `COOLIFY_DIRECTUS_APP` override the names). Both
directories are persistent volumes on the service, so a file mounted underneath
one simply appears inside it. Re-running is safe: the repo wins, and a file
whose stored content already matches is left alone.

**A new file storage is not a mount.** For a _service_, Coolify renders the
container from `docker_compose_raw`. A storage the compose does not name stays
in Coolify and is never bind-mounted, and neither `service restart` nor `deploy`
changes that. The three template mounts are in that compose because
someone put them there. So the first push of a new file needs a compose edit:

```yaml
services:
  directus:
    volumes:
      # …existing volumes…
      - "./directus/extensions/email-subjects/index.js:/directus/extensions/email-subjects/index.js"
```

The host side is the mount path with a leading `.`, because Coolify writes the
storage's content to `/data/coolify/services/<uuid><mount path>`. Edit it in the
UI (the service → **Compose file**) or `PATCH /api/v1/services/<uuid>` with a
base64 `docker_compose_raw`, then `coolify deploy uuid <uuid>`. The script
prints the exact lines to paste.

After that first mount, **every content change needs a redeploy**, templates
included. Coolify writes a file storage's content to the host only when it
renders the compose at deploy time. Until then the bind mount still serves the
previous revision, so the container keeps rendering the old file however often
Directus re-reads it.

| Change                   | Redeploy                                     |
| ------------------------ | -------------------------------------------- |
| Extension content change | Yes: extensions are registered at boot       |
| Template content change  | Yes: the host file is only written on deploy |

It has already gone wrong once. The 2026-09-02 push updated
`user-registration.liquid` in the storage with no deploy after it, so
registration mails kept rendering the older revision, the one with
`{{ projectLogo }}`. Without `PUBLIC_URL` that variable emits a relative
`/assets/<id>` that no mail client can resolve.

The script says which applies and prints the command. It can only tell a real
change from a no-op because the storage listing carries the stored content.

If a pushed file shows up inside the container as a _directory_ rather than a
file, that is a known Coolify file-mount bug ([#10398](https://github.com/coollabsio/coolify/issues/10398)):
delete the storage, push again, redeploy. Never edit a file storage's mount path
in the Coolify UI: doing so has wiped contents ([#4755](https://github.com/coollabsio/coolify/issues/4755)).

### Subject lines: the `email-subjects` extension

**Subject lines cannot be templated.** `Verify your email address`, `Password
Reset Request` and `You've been invited` are English defaults in
`api/src/services/users.ts` (the registration one marked TODO upstream). The
service methods take a `subject` argument, but neither REST route forwards one:
`POST /auth/password/request` and `POST /users/invite` read only the e-mail,
role and url from the body. Over the API the defaults always win.

`directus/extensions/email-subjects/` is the answer: a hook extension whose
`email.send` filter substitutes a Czech subject keyed on the template name.
`email.send` is a filter event, so what the handler returns is what gets sent.
It is plain ESM with no build step, so `vp run directus:push` pushes the two
files as-is.

Mail whose template the filter does not map — Flows, other extensions — passes
through untouched. The brand is not repeated in the subject: MailService already
puts the project name in the From display name.

After a push and a deploy, `GET /extensions` (or **Settings → Extensions** in
the admin app) must list `email-subjects`. Then trigger a password reset and
confirm the subject reads `Obnovení hesla`. If the extension is missing, the
compose is not mounting it. See the compose-edit note above.

It is live on the instance since 2026-09-02: `source: local`, `enabled: true`,
loaded from `/directus/extensions/email-subjects`.
