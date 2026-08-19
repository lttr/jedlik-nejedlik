---
status: done
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
---

# 03 — Registration

**What to build:** a visitor registers at `/registrace` with e-mail +
password only and is logged in immediately — no verification step, no
name fields. A passive line notes personal-data processing and links to
the privacy policy. Redirect rules match login.

## Acceptance criteria

- [x] Nitro register route creates the Directus user via the ticket-01
      service token; role is always Student
- [x] Duplicate e-mail → specific Czech error; password shorter than 8
      chars → clear Czech error (client-side validated too)
- [x] Successful registration ends logged in (same session shape as
      login) and honors `?redirect=`
- [x] Per-IP rate limit on the register route; no captcha
- [x] Logged-in Student opening `/registrace` is forwarded onward
- [x] Probes: register via the route's contract creates exactly a
      Student; rate limit kicks in; cleanup removes throwaway users

## Deferred

- The duplicate-e-mail and "ends logged in" paths need the service token to
  exercise; `auth.probe.ts` asserts the Directus half of both, and ticket
  06's round-trip covers the app half.
- The per-IP rate limit is an app concern, not a Directus one, so it has no
  probe. Verified directly against the dev server: five registration
  attempts pass through, the sixth answers 429 with the Czech message, and
  malformed payloads are rejected before they count against the limit.
