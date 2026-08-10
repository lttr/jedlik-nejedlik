---
status: ready
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

- [ ] `nuxt-auth-utils` added to `web/` and registered in
      `layers/customers/nuxt.config.ts`; session cookie configured
      (httpOnly, `sameSite: "lax"`, secure in production, 30-day `maxAge`)
- [ ] `#auth-utils` augmented with the `User` / `SecureSessionData` shapes
      from spec decision 1; tokens live only in `secure`
- [ ] `NUXT_SESSION_PASSWORD` declared in `privateSchema` in
      `web/server/runtime-config.schema.ts` (32-char minimum) and added to
      `web/.env.example`
- [ ] `layers/directus/server/utils/directus.ts` exposes
      `getServerDirectusClient()` — Nitro-side singleton, no domain logic
- [ ] `getStudentToken(event)` in `layers/customers/server/utils/`
      refreshes through Directus `/auth/refresh` inside a 60 s skew,
      writes the rotated pair back to the session, clears the session and
      throws 401 when refresh fails
- [ ] `POST /api/auth/login` validates input, calls Directus `login` +
      `readMe`, sets the session; `POST /api/auth/logout` revokes the
      refresh token at Directus and clears the session
- [ ] Login failure returns one message for unknown e-mail, wrong
      password, and unverified account alike
- [ ] `/prihlaseni` page with the login form, honouring a `?next=` path;
      `?next=` accepted only as a single-leading-slash path
- [ ] `/ucet` page renders the signed-in e-mail and a logout action,
      protected by the named `auth` middleware
- [ ] Unit tests green for the auth codecs, the error mapping, the `next=`
      sanitiser, and the refresh-expiry decision; `verify:test` task added
      to `vite.config.ts` and to `verify:all`
- [ ] Signed-out `/ucet` redirects to `/prihlaseni?next=/ucet`;
      `GET /api/_auth/session` exposes the `user` half and no token fields
- [ ] `vp run verify:all` green
