# Implementation notes — Area 02: Auth layer

Maintainer's log. Entries are appended as work happens; the orchestrator
owns this file.

## 2026-08-28 — Spec revision session (no app code written)

This session revised the spec and tickets and applied the instance
changes. **No implementation was started.** Ticket 02 was handed to an
implementer and stopped before it wrote anything; the working tree was
clean afterwards.

### Decision: registration switches to Directus native public registration

Reverses grilling Q7, which had chosen a Nitro route creating the user
with a dedicated service token. The user asked why a service account was
needed at all, and the honest answer is that it is only needed if public
registration is off — it governs _who creates the row_, never what the
created Student can do. Both designs produce an identical Student.

New design: `/registrace` proxies `POST /users/register` with a
`verification_url`; the instance assigns the role from
`public_registration_role`; the account is Unverified until the e-mailed
link is followed at `/overeni-emailu`.

What this bought:

- No service credential anywhere in the app, so no secret to provision,
  rotate, or leak, and no code path that can create a user at all.
- No Student role UUID in source. The first implementation had baked it
  in twice, which the rework brief flagged.
- Ticket 01 stopped being a blocker: it needs no secret handed to an
  implementer.

What it cost, accepted knowingly:

- **The specific duplicate-e-mail error is gone.** `POST /users/register`
  answers 204 whether or not the address exists — deliberate, so accounts
  stay unenumerable. The page shows one uniform confirmation that also
  tells an existing Student to log in. Story 5 was rewritten to match.
- **Registration now takes an inbox round-trip.** The user chose to keep
  `public_registration_verify_email` on ("verification email is
  absolutely okay, that's standard anyway") and explicitly accepted a
  slower first sign-in.
- **This sits inside the checkout path.** The platform is account-first,
  so buying now means register → leave the site → find an e-mail →
  return → log in → pay. Flagged in the spec's Further Notes for area
  04a to measure rather than assume.

### Decision: the e-mail in the session cookie is a cache

Settled by the user. Recorded in ADR 0002's new Consequences section
with the full reasoning. Short version: ADR 0001's "never a second store
of record" clause concerns the Nitro layer owning data, and the value is
derived, never queried, never written back, and rebuilt at every login.

It earns its place because the alternative is a `readMe` round-trip to
Directus on every SSR render _plus_ a `read` permission on
`directus_users` for the Student policy — a permission we deliberately
did not grant. Accepted cost: an e-mail changed in the Data Studio is
stale until the Student logs in again. Nothing in the app can change an
e-mail today; if self-service e-mail change ever ships, it must re-issue
the session.

### Correction: the service user never existed

`tickets/01` claimed "applied by the user on 2026-08-19: the service user
and its create-Student-only policy, its static token (present in Coolify
as `NUXT_DIRECTUS_SERVICE_TOKEN`)". The user confirmed the env var is not
in Coolify, and `policies.json` never listed such a policy. Nothing to
delete — but because one claim in that note was false, `REFRESH_TOKEN_TTL`
(ticked in the same note, no evidence) is treated as unverified and gets
its real proof in ticket 06. `PASSWORD_RESET_URL_ALLOW_LIST` kept its
tick: it carries recorded live evidence.

A first `directus:pull` this session also came back empty, i.e. the
settings changes had not landed yet at that point. Worth remembering
that a ticked box is not evidence; a clean pull is.

### Instance state, verified

`vp run directus:pull` confirms on the instance and in the dump
(commit `c317129`, after a green 63-test probe run):

- `public_registration: true`
- `public_registration_role: 186fdb62-…` (Student)
- `public_registration_verify_email: true`
- Student policy: `update` on `directus_users`, fields `["password"]`,
  filter `{"id": {"_eq": "$CURRENT_USER"}}`

The field narrowing matters as much as the row filter: row scope alone
would still let a Student edit `role`, `policies` and `status` on their
own record and self-promote.

Env vars set by hand by the user and invisible to directus-sync:
`USER_REGISTER_URL_ALLOW_LIST`, `PASSWORD_RESET_URL_ALLOW_LIST`,
`REFRESH_TOKEN_TTL=30d`, and `NUXT_SESSION_PASSWORD` on the site app.

### Carried over from a forked session

Two commits landed on `master` from a fork of this session, both useful
and already relied upon by ticket 02's plan:

- `adca6ab` — declares `session.password` in the runtime-config schema
  and requires 32+ chars, so Nitro fails at boot rather than sealing
  cookies with a weak key. Ticket 02 must not redo this.
- `9dff851` — narrows the pre-commit probe gate to the Directus dump.

### Left for the implementation session

- Ticket 02 is the only frontier ticket; 03, 04 and 05 unblock together
  once it lands, and 06 closes the area.
- Reuse from PR #16 (`origin/claude/auth-customers-impl-bv37rx`), still
  good as written: `safeRedirectPath` (resolves against a throwaway
  origin), `useAuthForm()`, `auth-messages.ts`, `rate-limit.ts`. Its
  session core is what nuxt-auth-utils replaces — read, don't port.
- Three questions deliberately deferred to implementation, each with a
  fallback recorded in its ticket: whether Directus distinguishes an
  Unverified login from bad credentials (ticket 02); the exact request
  property name for the verification URL, `verification_url` per the SDK
  docs but unconfirmed against the instance (ticket 03); whether
  `directus_sessions` accepts policy permissions, which decides how
  password change invalidates other sessions (ticket 05).
