---
status: accepted
---

# A Student verifies their e-mail before any session exists, and a session is only ever minted from a password

## Context

The platform is account-first (epic decision O-17): every Order and
Entitlement belongs to an Account identified by its e-mail. Area 02 turned
Directus's `public_registration_verify_email` on, so a fresh registration is
an unverified Directus user that cannot log in until the e-mailed link is
followed. Sessions are Nitro-mediated (ADR 0002): the cookie holds Directus
access and refresh tokens, which Directus issues only in exchange for a
password. The verification link is Directus's own; it flips the user to
active and returns nothing a session could be built from.

Area 04 (checkout) put these two facts in one flow. A visitor without an
Account who wants to buy registers inside the checkout, leaves for their
inbox, clicks the link, and is then asked for the password they typed a
minute earlier. The prototype (`.aiwork/2026-09-15_checkout-gopay/prototype/`)
made the step visible and it reads as a wart.

## Decision

Keep both: verification stays mandatory before any session, and the
post-verification step asks for the password again. The checkout reduces the
step to its minimum: the verification page sends the Student back to the
checkout, the e-mail is pre-filled, only the password is typed, the button
reads „Pokračovat".

## Why

- **Verification is load-bearing, not cosmetic.** The e-mail is where the
  invoice (area 05) and the contract confirmation the law requires before
  access (§ 1824a, area 10) are sent, and it is the only identity the
  Student has for a password reset. A typo'd address would mean a paid
  Order bound to an inbox nobody owns. Area 02 accepted the slower first
  sign-in for this reason on 2026-08-28 and flagged the checkout cost for
  area 04 to measure rather than assume; this ADR is that measurement's
  answer.
- **The password step is where Directus puts it.** Removing it means
  taking registration and verification away from Directus and issuing
  sessions without a password, which is the magic-link login area 02
  deferred out of v1. It would roughly double area 04 and move an
  auth-layer feature into the shop.

## Considered options

- **No verification** (area 02's original grilling recommendation): rejected
  there and again here, for the reasons above.
- **The checkout tab waits for verification** and logs in with the
  credentials it still holds in memory, polling a Nitro route bound to a
  registration cookie. Works without storing the password anywhere, but adds
  a polling route, a fallback for a closed tab, and Directus login-rate
  concerns. Parked: the first candidate if the drop-off at this step turns
  out to matter.
- **Magic link**: parked with area 02's deferral.

## Consequences

- The checkout's registration branch must say up front that the password
  will be used once more after the e-mail is verified.
- The verification page needs to know where to return; area 04 uses a
  short-lived pending-checkout cookie because the verification URL is an
  exact-match allow-list entry on the Directus instance and cannot carry a
  redirect parameter.
- Any later passwordless flow supersedes the second paragraph of this ADR,
  not the first.
