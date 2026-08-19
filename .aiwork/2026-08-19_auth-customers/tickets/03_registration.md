---
status: ready
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

- [ ] Nitro register route creates the Directus user via the ticket-01
      service token; role is always Student
- [ ] Duplicate e-mail → specific Czech error; password shorter than 8
      chars → clear Czech error (client-side validated too)
- [ ] Successful registration ends logged in (same session shape as
      login) and honors `?redirect=`
- [ ] Per-IP rate limit on the register route; no captcha
- [ ] Logged-in Student opening `/registrace` is forwarded onward
- [ ] Probes: register via the route's contract creates exactly a
      Student; rate limit kicks in; cleanup removes throwaway users
