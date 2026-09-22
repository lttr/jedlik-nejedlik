# Notes — shortening pass

Flagged comments before: 159. After: 52. Four agents worked the areas in
parallel; the moved explanations were merged into `docs/shop.md` and
`docs/analytics.md` by hand (duplicate section titles from different agents
merged into one section each).

## Left standing

- **`rewrite — leans on an undefined term` (38)**: every one names a
  GLOSSARY.md headword (Account, Student, Checkout, Payment, Shop Service
  Account, …) or an ADR number, both defined in the repo. Rejected as a class,
  as in the previous pass.
- **`rewrite — hard to follow` (4)**: `password-change.ts:26-28`, `:46-48`,
  `password-reset.ts:58-61`, `settle-payment.ts:9-12`. Each is a two-line
  security argument already cut to the bone; rewriting would be churn.
- **`remove` on a pointer comment (6)**: `cookie-consent.ts:29`,
  `clarity.client.ts:1`, `live-courses.ts:1`, `settle-payment.ts:9`,
  `shop-service-client.ts:3`, `checkout-order.ts:10`. One line plus
  `See docs/…`; the pointer is the point.
- **`remove` on a guarded property (7)**: `account-session.ts:158` (Directus
  permission rule), `account.ts:1` (cache, never written back), `account.ts:11`
  (epoch ms), `CourseCover.vue:12` (empty alt on purpose),
  `TestKurzPublikovany.vue:50` (price in copy is a defect),
  `AccountStep.vue:44` (deliberately not persisted), `account-billing.ts:6`
  (`/users/me`, no user id in shop code).

- **`shorten` (2)**: `emailed-token.ts:7` and `page-error.ts:1` sit at 41–42
  words after the cut; both sentences carry a distinct reason.

## Not done

- No behaviour pass: the diff removes or shortens comment lines only (checked
  by filtering the diff for non-comment lines: none).
- `.aiwork/2026-09-22_explicit-imports-layers/spec.md` (untracked, another
  task) failed `check:lint` formatting; it was formatted in place so
  `check:all` could pass. Not committed here.
