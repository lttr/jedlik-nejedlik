# Ops checklist — area 02

Everything this area needs that lives outside the repo, or needs Directus
admin credentials the implementing session did not have. Items the user
already confirmed as applied (ticket 01) are listed for completeness, so the
whole instance-side state of the area is in one place.

## Applied by the user (ticket 01)

- Service user + "create Student-role users only" policy.
- Static token for that service user.
- `REFRESH_TOKEN_TTL=30d`.
- `PASSWORD_RESET_URL_ALLOW_LIST=https://www.jedlik-nejedlik.cz/obnova-hesla`.
- `public_registration` left off.

## Still outstanding

### 1. Env var for the service token

The app reads the token as the private runtime-config key
`directusServiceToken`, i.e. environment variable:

```
NUXT_DIRECTUS_SERVICE_TOKEN=<static token of the service user>
```

Needed in Coolify (production) and in `web/.env` for local dev. Nitro
refuses to boot without it (the runtime-config schema validates it), so a
missing value fails loudly at deploy rather than at the first registration.

### 2. Two Student-policy permissions in Directus

Both are on the **Student** policy (`a17cfc9d-ebf3-4254-a6bd-ce43f77ddb1d`)
against the `directus_users` collection, scoped to the Student's own row:

| Action   | Fields        | Rule                                   |
| -------- | ------------- | -------------------------------------- |
| `read`   | `id`, `email` | `{ "id": { "_eq": "$CURRENT_USER" } }` |
| `update` | `password`    | `{ "id": { "_eq": "$CURRENT_USER" } }` |

- The **read** permission is what makes `/users/me` answer for a Student.
  Without it `useStudent()` resolves to logged-out even with a valid
  session, and the account page has no e-mail to show (ticket 02).
- The **update** permission is what lets a logged-in Student change their
  own password through the session-bound client (ticket 05).

### 3. Refresh the committed Directus config dump

After 1–2 above, with an admin token in `DIRECTUS_TOKEN`:

```
vp run directus:pull
vp run directus:diff   # expect: no changes
```

Commit the resulting `directus/config/**` diff. It should show the service
role/policy/permissions from ticket 01 plus the two Student permissions
above.

### 4. Probe tokens

`web/tests/probes/auth.probe.ts` needs two environment variables:

```
DIRECTUS_PROBE_SERVICE_TOKEN=<the registration service token>
DIRECTUS_PROBE_ADMIN_TOKEN=<admin token>   # already used by area 01's probes
```

Then `vp run directus:probe` (with the sandbox disabled — Node's fetch
cannot reach the network inside the agent sandbox).

### 5. Manual round-trip (ticket 06)

Needs an inbox, so it cannot be automated: register → logout → login →
request reset → follow the e-mailed link → set a new password → log in →
change the password on `/muj-ucet`. Check the Czech rendering of the reset
e-mail while you are there.
