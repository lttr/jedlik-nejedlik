---
status: done
verified: [checks, probes, behaviour]
blocked_by: [03]
references:
  - "Spec: ../spec.md"
  - "Prototype (variant C, step 1): ../prototype/index.html"
  - "ADR 0005: ../../../docs/adr/0005-verified-email-before-any-session.md"
  - "Auth spec (redirect, verification): ../../2026-08-19_auth-customers/spec.md"
---

# 06 — Guest at the Checkout

**What to build:** a visitor without an Account opens `/objednavka/<slug>` and completes the purchase without leaving the page except for their inbox. Step 1 offers tabs „Mám účet" (login) and „Jsem tu poprvé" (registration, with a line saying the password will be used once more after e-mail verification). After registering, step 1 shows „Zkontrolujte e-mail". The verification link brings them back to this Checkout, where step 1 shows the e-mail pre-filled, a password field and „Pokračovat" (ADR 0005). Steps 2 and 3 unlock after login.

Mechanism: a pending-checkout cookie (Course slug, 24 h, httpOnly, lax) set when a visitor opens the Checkout; the login page and the verification landing use it as the redirect target when no `?redirect=` is present, then clear it. Existing safe-redirect rules apply. Start by running the probes: if the registration allow-list probe is red, the instance's `USER_REGISTER_URL_ALLOW_LIST` must be fixed before this ticket can be verified.

## Acceptance criteria

- [x] A visitor logs in inside step 1 and continues to step 2 without a page change
- [x] A visitor registers inside step 1, follows the verification link in a new tab, and lands on the same Checkout with the e-mail pre-filled and only a password to type; after „Pokračovat" step 2 is open
- [x] The password warning is shown in the registration tab before submitting
- [x] The pending-checkout cookie is cleared after use; a visitor who verifies without a pending checkout still lands on the login page with the existing notice
- [x] Logged-in visitors opening the Checkout never see step 1's forms; the auth layer's redirect rules still reject foreign targets (unit test)
- [x] Verified with the `verify` skill for both tabs at desktop and 375 px; `vp run check:all` green
