# Grill — Area 04 (checkout + GoPay), round 3

Round 2 settled: pending-checkout cookie (Q14); Billing Details on the Account with a snapshot on the Order (Q16); final button „Objednávka zavazující k platbě" (Q18); § 1824a confirmation e-mail deferred to area 10 with a hook in the grant path (Q19); static recap copy, friendly wording (Q20); implementer applies Directus changes via MCP then pulls (Q21); mock gateway (Q23); go-live follow-up as its own folder (Q24); „Moje kurzy" on `/muj-ucet` (Q25); unpriced Course cannot be bought (Q26); no IP filter on the notification route (Q27).

Glossary updated with: Checkout, Payment, Consent, Billing Details, Service Account.

## Explanations you asked for

**Q22 — why a Service Account.** Area 01 gave the Student policy exactly the writes a buyer may make: create their own Order and its Consents. It deliberately withheld `status`, `gopay_payment_id`, and any write on `entitlement`, so a Student with a stolen session token cannot mark themselves paid or grant themselves a Course. Those writes still have to happen, and they happen in Nitro after talking to GoPay. Nitro therefore needs its own Directus credential. The choices are the admin token (one leak = full control of the CMS, users, files) or a dedicated Account whose policy allows only those three writes plus the reads it needs. The second is the one ADR 0001 and 0004 anticipated. It costs one Directus user, one policy, one env var.

ok might be but what would it take to not create a service account? any risks?

**Q24 — how go-live depends on areas beyond 04.** Two different gates:

- _Sandbox on the deployed site_ depends only on this area: GoPay sandbox credentials + `GOPAY_ENV=sandbox` on Coolify + running GoPay's test scenario against the real notification URL. Can happen as soon as this area ships.
- _Production GoPay_ additionally depends on area 05 (invoice per sale is a legal duty on request and the client expects it), area 10 (the § 1824a confirmation e-mail, terms approved by the lawyer; without the e-mail every buyer keeps a 14-day full-refund right), and the `[TEST]` fixture cleanup from area 03. So the go-live folder has two stages with different `blocked_by`. Area 09 (asset ingestion), 06–08 (player, quiz, video) do not gate go-live of _selling_, but selling a Course nobody can watch is a product call, not a technical dependency; I will note it.

dependencies should be noted in involved tactical docs.

**Q27 — why rate limit + 200 on unknown id.** The notification route is public and unauthenticated (GoPay signs nothing). Each call makes us do an outbound GoPay lookup, so without a limit anyone can make our server hammer GoPay's API with our token. The existing per-IP limiter is free to reuse. Answering 200 for an unknown payment id: GoPay retries any non-200 up to 20 times; an id we do not know is either a forged call or a payment from another shop, and retrying will not change that, so 200 stops the noise. We log it so a real mismatch (e.g. lost `gopay_payment_id`) is visible in Sentry.

## Questions

**Q28 - Consent wording, revised (your Q17 answer)**
Your two generic sentences cannot be used as written: (1) "I agree to the privacy policy" must not be asked, ÚOOÚ treats a forced privacy consent as invalid and as a violation; (2) "I agree to the terms" alone does not meet § 1837, which needs an express statement about starting _now_ and an acknowledgement of losing the refund right, otherwise the buyer can watch the whole course and get a full refund within 14 days. Friendly wording that still carries both elements:

- Checkbox 1 (required): „Souhlasím s obchodními podmínkami kurzu." (link)
- Checkbox 2 (required): „Chci kurz otevřít hned po zaplacení. Rozumím, že tím ztrácím možnost do 14 dnů od nákupu odstoupit a požádat o vrácení peněz." (link „Proč se ptáme?" opening a short plain-language note; the § reference lives in that note and in the terms, not in the checkbox)
- Line, no checkbox: „Vaše údaje zpracováváme podle zásad ochrany osobních údajů." (link)
  Records: `terms` and `withdrawal_1837`, each with the document's effective date as version. Nothing for `gdpr`.
  (A) as above
  (B) merge into one checkbox: „Souhlasím s obchodními podmínkami a chci kurz otevřít hned po zaplacení; rozumím, že tím ztrácím možnost do 14 dnů odstoupit." — one record per document still written
  Recommended: A. Two short boxes read easier than one long one, and the § 1837 box stands alone as the law prefers.
  Answer: i don't like the part 'Rozumím, že tím ztrácím možnost do 14 dnů od nákupu odstoupit a požádat o vrácení peněz.' it should be noted in the docs, but i dont necesserily want to restrict user. She might ask for refund, why not? Take it easy and do one simple checkbox.

**Q29 - Prototype for guest checkout (your Q15 answer)**
(A) a ticket at the front of this area: integrated prototype on a `prototype/checkout-guest` branch, two variants on `/objednavka/<slug>` selected by `?variant=`: A = redirect to login, B = inline login/register panel on the checkout page; verdict recorded in the spec before the checkout ticket starts. The spec is written so both are implementable (the checkout route is the same; only the page differs).
(B) run `/aiwork:prototype` now, before the spec, and settle it in the spec directly
Recommended: B. It is a UX question that changes the page ticket's scope; settling it before `to-spec` avoids a spec with a fork in it. It costs one prototype session.
Answer: the prototype needs to be run before implementation starts, at spec
time.

**Q30 - Registration during checkout: name field?**
With Billing Details on the Account, a buyer who registers mid-checkout will type their e-mail + password, verify, log in, then land on the checkout and type their name. Alternative: registration stays e-mail + password (area 02's decision), no change.
(A) no change; the checkout is where the name is asked
(B) add an optional name to registration
Recommended: A.
Answer: A. name should not block registration

**Q31 - Return page copy and states**
The return route inquires GoPay, then shows one of: paid („Kurz je váš" + „Moje kurzy" button), pending („Platbu ještě ověřujeme…", auto-refresh a few times, then „Jakmile platba dorazí, kurz najdete v Moje kurzy"), failed/cancelled („Platba neproběhla" + „Zkusit znovu" back to the checkout).
(A) as above, on `/objednavka/<id>/navrat`
(B) reuse a single „Moje kurzy" page with a banner instead of a dedicated return page
Recommended: A.
Answer: ok

**Q32 - ADR**
Candidate: "Shop writes through a Service Account; Students write only their own Orders". Hard to reverse (permissions, token, probes), surprising later (why two Directus clients in one route), a real trade-off (admin token / Student-only / Directus Flows were alternatives).
(A) write ADR 0005 during implementation
(B) no ADR, the spec is enough
Recommended: A.
Answer: ok

**Q33 - `areas.md` corrections while at it**
When this spec is written: mark 03 done with its link, point 04a/04b at this folder, add the § 1824a confirmation e-mail to area 10's scope, add the go-live folder under a new line, and note that Billing Details moved into 04 from 05.
(A) yes, in the same commit as the spec
(B) leave areas.md alone
Recommended: A.
Answer: ok
