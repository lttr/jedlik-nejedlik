---
status: ready
blocked_by: [01, 02]
references:
  - "Spec: ../spec.md"
  - "Prototype (variant C): ../prototype/index.html"
  - "ADR 0004: ../../../docs/adr/0004-course-pages-read-through-nitro.md"
---

# 03 — Checkout for a logged-in Student

**What to build:** a logged-in Student opens `/objednavka/<slug>` from the Sales Page's „Koupit kurz", sees the three-step page from the prototype with step 1 collapsed to their e-mail, fills Billing Details and ticks the terms checkbox in step 2, presses „Objednávka zavazující k platbě" in step 3, and lands on the gateway (the mock in dev). Behind it: the Billing Details are saved to the Account, an Order with its Consent and billing snapshot is created by the Student's own session, the Payment is created with the amount re-read from the Course, and the Service Account stamps the Payment id on the Order.

Layout per the prototype: steps left, Course recap sticky right, single column at 375 px. Delivery copy static (immediate access, no time limit, streamed video in the browser). Privacy policy as an informational line. Czech typography via the `writing:czech-typography` skill.

## Acceptance criteria

- [ ] A Student reaches the mock gateway page from the Checkout, and afterwards Directus holds one Order in `created` with `price_czk`, the billing snapshot, `gopay_payment_id`, and one Consent (`terms`, version = the terms' effective date, `granted_at` set by the preset)
- [ ] The Billing Details typed in step 2 are saved on the Account and pre-filled on the next visit; all fields optional, the company/address block collapsed by default
- [ ] The checkbox is required and unticked; the button text is „Objednávka zavazující k platbě"; step 3 repeats Course, total price and „Neplátce DPH"
- [ ] A Student who already holds an Entitlement gets 409 and the page never shows the form; a Course without a price gets 409; a draft Course is available to an Author only
- [ ] Returning to the Checkout while a previous Payment is still live sends the Student to the same Payment instead of creating an Order; after CANCELED/TIMEOUTED a new Order is created
- [ ] The charged amount comes from the Course's current price even if the request carries a different `price_czk`
- [ ] Checkout route rate-limited with the auth layer's limiter; verified with the `verify` skill at desktop and 375 px; `vp run check:all` green
