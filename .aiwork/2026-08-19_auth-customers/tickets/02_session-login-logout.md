---
status: done
blocked_by: [01]
references:
  - "Spec: ../spec.md"
  - "ADR: ../../../docs/adr/0002-nitro-mediated-auth-sessions.md"
---

# 02 — Session foundation: login, logout, sliding session

**What to build:** an existing Student logs in at `/prihlaseni`, lands on
a minimal `/muj-ucet` (their e-mail + logout), stays logged in across
reloads and SSR for up to 30 sliding days, and can log out. The header
reflects logged-in/out state. `?redirect=` (same-origin paths only) is
honored, falling back to `/muj-ucet`; a logged-in Student opening
`/prihlaseni` is forwarded onward; a guest deep-linking to a protected
page is bounced to login and returned after.

## Acceptance criteria

- [x] Nitro routes proxy Directus login/refresh/logout; tokens live only
      in httpOnly, secure, SameSite=Lax cookies on the site domain
- [x] Transparent server-side refresh when the access token expires — no
      visible logout, no client-side refresh logic
- [x] Per-request authenticated Directus server client available to any
      layer's SSR/Nitro code; the anonymous client and all existing
      public-content fetching untouched
- [x] `useStudent()` returns `{ student, loggedIn }`, identical on SSR
      and client (no hydration flicker)
- [x] Named `auth` route middleware, opt-in per page, guards `/muj-ucet`
- [x] Wrong credentials show a generic Czech error (no enumeration)
- [x] `auth.probe.ts` covers login/refresh/logout round-trip and wrong
      credentials against production, self-cleaning, probe-suite
      conventions

## Deferred

- Running the probe suite is ticket 06's criterion and needs
  `DIRECTUS_PROBE_SERVICE_TOKEN` + `DIRECTUS_PROBE_ADMIN_TOKEN`, which the
  implementing session did not have.
- `useStudent()` reads the Student's e-mail through `/users/me`, which the
  Student policy must permit. That instance permission belongs with ticket
  01's ops work and is listed in `../ops-checklist.md`; until it exists,
  a logged-in Student resolves as logged out and the route logs
  "Directus rejected readMe for a live session".
