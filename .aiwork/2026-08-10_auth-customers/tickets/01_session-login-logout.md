---
status: done
blocked_by: []
references:
  - "Spec: ../spec.md"
---

# 01 — Session plumbing + login / logout

**What to build:** the session foundation the rest of the area stands on —
`nuxt-auth-utils` wired into the `customers` layer, Directus tokens held
server-side, and the first flow that exercises it end to end: log in, stay
logged in across SSR, log out.

Covers spec decisions 1, 2, 5, 6 (login half), 7.

## Acceptance criteria

- [x] `nuxt-auth-utils` added to `web/` and registered in
      `layers/customers/nuxt.config.ts`; session cookie configured
      (httpOnly, `sameSite: "lax"`, secure in production, 30-day `maxAge`)
- [x] `#auth-utils` augmented with the `User` / `SecureSessionData` shapes
      from spec decision 1; tokens live only in `secure`
- [x] `NUXT_SESSION_PASSWORD` declared in `privateSchema` in
      `web/server/runtime-config.schema.ts` (32-char minimum) and added to
      `web/.env.example`
- [x] `layers/directus/server/utils/directus.ts` exposes
      `getServerDirectusClient()` — Nitro-side singleton, no domain logic
- [x] `getStudentToken(event)` in `layers/customers/server/utils/`
      refreshes through Directus `/auth/refresh` inside a 60 s skew,
      writes the rotated pair back to the session, clears the session and
      throws 401 when refresh fails
- [x] `POST /api/auth/login` validates input, calls Directus `login` +
      `readMe`, sets the session; `POST /api/auth/logout` revokes the
      refresh token at Directus and clears the session
- [x] Login failure returns one message for unknown e-mail, wrong
      password, and unverified account alike
- [x] `/prihlaseni` page with the login form, honouring a `?next=` path;
      `?next=` accepted only as a single-leading-slash path
- [x] `/ucet` page renders the signed-in e-mail and a logout action,
      protected by the named `auth` middleware
- [x] Unit tests green for the auth codecs, the error mapping, the `next=`
      sanitiser, and the refresh-expiry decision; `verify:test` task added
      to `vite.config.ts` and to `verify:all`
- [x] Signed-out `/ucet` redirects to `/prihlaseni?next=/ucet`;
      `GET /api/_auth/session` exposes the `user` half and no token fields
- [x] `vp run verify:all` green

## Verification notes

Observed against a dev server on real Directus: signed-out `/ucet` → 302
`/prihlaseni?next=/ucet`; `/api/_auth/session` anonymous → `{"id":…}` with
no `user` and no tokens; `/prihlaseni` renders the form; bad credentials →
401 "Nesprávný e-mail nebo heslo."; malformed body → 400, same message.

Two things could not be observed without Student credentials, which no
agent session has: the **signed-in** session payload and the cookie
attributes (both need a successful login). The payload is guaranteed by
construction — `nuxt-auth-utils`' session route does
`const { secure, ...data } = session`, read at source, which is the whole
reason tokens live in `secure`. The cookie attributes come from the
module's `sameSite: "lax"` default plus h3's `useSession` defaults
(httpOnly, secure, path `/`), with `maxAge` set explicitly here. Both get
their real check in ticket 04's live round-trip.
