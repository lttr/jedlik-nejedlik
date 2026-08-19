---
status: ready
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

- [ ] Nitro routes proxy Directus login/refresh/logout; tokens live only
      in httpOnly, secure, SameSite=Lax cookies on the site domain
- [ ] Transparent server-side refresh when the access token expires — no
      visible logout, no client-side refresh logic
- [ ] Per-request authenticated Directus server client available to any
      layer's SSR/Nitro code; the anonymous client and all existing
      public-content fetching untouched
- [ ] `useStudent()` returns `{ student, loggedIn }`, identical on SSR
      and client (no hydration flicker)
- [ ] Named `auth` route middleware, opt-in per page, guards `/muj-ucet`
- [ ] Wrong credentials show a generic Czech error (no enumeration)
- [ ] `auth.probe.ts` covers login/refresh/logout round-trip and wrong
      credentials against production, self-cleaning, probe-suite
      conventions
