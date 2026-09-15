---
status: ready
blocked_by: [01]
references:
  - "Spec: ../spec.md"
  - "Catalog spec (purchase button): ../../2026-09-14_catalog-sales-pages/spec.md"
---

# 05 — „Moje kurzy", „Fakturační údaje" and the Sales Page button states

**What to build:** the Account page shows the Courses the Student owns and lets them edit their Billing Details, and the Sales Page reflects ownership. „Moje kurzy" lists Entitlements with cover and title and a „Kurz se připravuje" placeholder until the player exists (area 06); read through a shop-layer Nitro route with the caller's session. „Fakturační údaje" reuses the Billing Details form component from the Checkout (build it here if this ticket lands first). The Sales Page's Nitro route gains the caller's Entitlement for the Course; the button reads „Koupit kurz" for a visitor or a Student without one, „Přejít do kurzu" (to „Moje kurzy") for an owner, and is absent when the Course has no price.

## Acceptance criteria

- [ ] With an Entitlement granted by hand in Directus, „Moje kurzy" lists that Course with cover, title and the placeholder; an anonymous visitor is sent to login; a Student with no Entitlement sees an empty state
- [ ] „Fakturační údaje" pre-fills from the Account, saves, and a probe shows the fields land on the Student's own row only
- [ ] Sales Page button in all three states, including the owner's „Přejít do kurzu"; the Entitlement read uses the caller's session (ADR 0004), no Service Account
- [ ] Verified with the `verify` skill at desktop and 375 px; `vp run check:all` green
