# Findings inventory

Raw `lint-comments --format text` output, graded 2026-09-22 at `f043976`.
**352 flagged comments / 428 findings** across 140 files.

## Coverage

252 gradable files are tracked (`.js .mjs .cjs .jsx .ts .mts .cts .tsx .vue
.css .scss .html`). **248 were passed to the linter.** The 4 not graded are
`.aiwork/` prototypes and wireframes, excluded deliberately (see `spec.md`,
"Scope"):

```
.aiwork/2026-02-09_sekce-pro-odborniky/wireframe.html
.aiwork/2026-05-04_agent-feedback-loops/audit.html
.aiwork/2026-06-09_kurzy-platforma/spec-kurzy.html
.aiwork/2026-09-15_checkout-gopay/prototype/index.html
```

`web/archive/` **was** graded (1 finding, in the last section) and is then
excluded from the work as dead code.

A file with no findings produces no output, so coverage is established by the
paths passed below, not by which files appear in the sections.

## Regenerating

`--cache` reuses grades from the gitignored `.lint-comments-cache.json`, so a
re-run on an unchanged file is free. On a changed comment the model grades
again and the wording may shift.

```sh
lint-comments web/app --cache --format text
lint-comments web/layers --cache --format text
lint-comments web/server web/shared web/tests scripts --cache --format text
lint-comments web/nuxt.config.ts web/eslint.config.js \
  web/sentry.client.config.ts web/sentry.server.config.ts \
  vite.config.ts web/app/assets --cache --format text
lint-comments certificate directus/extensions directus/sync.config.cjs \
  .claude/skills/dependency-update/scripts/dep-scan.mjs \
  web/env.d.ts web/reset.d.ts web/vitest.probes.config.ts \
  web/vitest.unit.config.ts web/archive --cache --format text
```

## `web/app`

```
web/app/assets/css/main.css:79
  TODO general border, needs for more elements probably
  todo-without-ref  no issue reference

web/app/assets/css/main.css:98-100
  A refusal that is neither a failure nor good news — „this Course is not on…
  shorten           43 words

web/app/components/CookieConsentBar.vue:9
  Both choices weigh the same: same class, same size, same colours.
  remove            answers a question the reader would not ask (62%); it is a reason, not a description (97%)

web/app/components/CookieConsentBar.vue:22-25
  The bar is fixed over the bottom of the page, so without this the footer's…
  shorten           48 words

web/app/components/layout/Footer.vue:73-74
  Puleo's button styles are all :where()-wrapped, so a plain class outranks them.…
  rewrite           leans on an undefined term or reference (82%)

web/app/components/LiveCourseBuyLink.vue:11-13
  Every Live Course buy button goes through here, so a new one cannot ship…
  remove            answers a question the reader would not ask (60%); it is a reason, not a description (98%)

web/app/components/LiveCoursePromo.vue:239
  e.g. "6.–9. třída"
  remove            restates the code (72%); a reader would not have wondered about the code (71%)

web/app/components/LiveCoursePromo.vue:241
  e.g. "6." — used in the "od X do Y třídy" sentence
  remove            restates the code (69%); a reader would not have wondered about the code (53%)

web/app/components/LiveCoursePromo.vue:243
  e.g. "9." — used in the "od X do Y třídy" sentence
  remove            restates the code (80%); a reader would not have wondered about the code (69%)

web/app/components/LiveCoursePromo.vue:245
  e.g. "22. 9. 2026 – 23. 2. 2027"
  remove            restates the code (72%); a reader would not have wondered about the code (79%)

web/app/components/LiveCoursePromo.vue:247
  e.g. "Úterý 17:05–18:20"
  remove            restates the code (73%); a reader would not have wondered about the code (79%)

web/app/components/LiveCoursePromo.vue:251
  Dates of lessons 1–5
  remove            restates the code (68%); a reader would not have wondered about the code (73%)

web/app/components/LiveCoursePromo.vue:255
  Maximum number of children in the group
  remove            restates the code (80%); a reader would not have wondered about the code (78%)

web/app/components/LiveCoursePromo.vue:257
  Live Course the "Objednat kurz" button sells
  remove            restates the code (89%); a reader would not have wondered about the code (68%)

web/app/components/LiveCoursePromo.vue:610
  Responsive
  remove            repeats the next line (74%)

web/app/components/ObesityCoursePromo.vue:1061
  Responsive
  remove            repeats the next line (77%)

web/app/components/PageWrapper.vue:16
  TODO this was useful on homepage
  todo-without-ref  no issue reference

web/app/components/PageWrapper.vue:17
  row-gap: var(--space-7);
  dead-code         every line is markup or a style rule

web/app/components/ThankYouPage.vue:14-16
  The shell every thank-you page shares: centred card, success icon, heading,…
  remove            answers a question the reader would not ask (73%); it is a reason, not a description (51%)

web/app/components/ThankYouPage.vue:46-49
  The page's own copy arrives through the slot, so it carries the page's scope…
  rewrite           hard to follow on first reading (80%)
  shorten           49 words

web/app/composables/cookie-consent.ts:29-35
  The visitor's cookie decision, kept in `localStorage` only. Nothing about it…
  rewrite           hard to follow on first reading (76%)
  shorten           60 words

web/app/composables/watch-async-data-error.ts:5-9
  `useAsyncData` catches handler/transform errors into `.error.value` and…
  rewrite           hard to follow on first reading (77%)
  shorten           50 words

web/app/pages/(homepage)/index.vue:4-12
  <HeroSection />…
  dead-code         every line is markup or a style rule

web/app/pages/dekujeme-za-objednavku-kurzu.vue:20-25
  Where SimpleShop sends a Live Course buyer after payment ("URL po uhrazení"),…
  shorten           48 words

web/app/pages/pro-rodice.vue:50-68
  TODO: Courses Section…
  dead-code         a TODO heading followed by commented-out code

web/app/pages/pro-rodice.vue:172-220
  TODO: Courses Section…
  dead-code         every line is markup or a style rule

web/app/pages/webinar-generace-alfa.vue:742
  Responsive
  remove            repeats the next line (77%)

web/app/plugins/clarity.client.ts:1-8
  Loads Microsoft Clarity, gated on the same cookie consent as the Meta Pixel.…
  shorten           53 words

web/app/plugins/meta-pixel.client.ts:1
  Standard Meta events this site sends. Not a `value` or a price among them.
  remove            restates the code (82%); a reader would not have wondered about the code (66%)

web/app/plugins/meta-pixel.client.ts:26-35
  Claims the one slot this event has in the current session, returning whether…
  shorten           82 words

web/app/plugins/meta-pixel.client.ts:49-64
  Loads the Meta Pixel, but only once the visitor accepted cookies, and hands…
  rewrite           hard to follow on first reading (80%)
  shorten           131 words

web/app/plugins/meta-pixel.client.ts:75-84
  The proxy queues calls made before the script loads, so a call from a…
  rewrite           hard to follow on first reading (81%)
  shorten           119 words

web/app/utils/live-courses.ts:1-11
  The Live Courses that are actively sold and measured.…
  shorten           88 words
```

## `web/layers`

```
web/layers/auth/app/composables/account.ts:10-14
  The single seam onto nuxt-auth-utils' client API. Identical on SSR and…
  rewrite    leans on an undefined term or reference (82%), hard to follow on first reading (77%)
  shorten    44 words

web/layers/auth/app/composables/auth-form.ts:10
  `validate` returns a Czech complaint, or null when the form may be sent.
  remove     restates the code (97%); a reader would not have wondered about the code (62%)

web/layers/auth/app/composables/auth.ts:13-14
  The only way the app talks to the auth routes. Credentials go out, a sealed…
  rewrite    leans on an undefined term or reference (83%)

web/layers/auth/app/composables/auth.ts:29-30
  Neither ends logged in: the account is Unverified until the e-mailed…
  rewrite    leans on an undefined term or reference (85%)

web/layers/auth/app/composables/auth.ts:48-49
  Re-seals this session and ends every other; the payload's identity is…
  rewrite    leans on an undefined term or reference (83%)

web/layers/auth/app/composables/emailed-token.ts:2
  The `?token=` value, captured during setup, before the URL is cleaned.
  remove     restates the code (76%); a reader would not have wondered about the code (55%)

web/layers/auth/app/composables/emailed-token.ts:8-12
  Both pages reached from an e-mailed link arrive with a one-shot secret in…
  shorten    58 words

web/layers/auth/app/composables/emailed-token.ts:20
  Nothing to scrub when the page was opened by hand.
  remove     answers a question the reader would not ask (64%); it is a reason, not a description (62%)

web/layers/auth/app/middleware/auth.ts:1-3
  Opt-in via `definePageMeta({ middleware: "auth" })`. UX only: what an…
  rewrite    leans on an undefined term or reference (84%)

web/layers/auth/app/middleware/guest.ts:1
  A logged-in Account has no business on the login form; send them on.
  remove     answers a question the reader would not ask (66%); it is a reason, not a description (77%)

web/layers/auth/app/pages/muj-ucet.vue:14-17
  Shop-layer sections, included here because the Account page is the…
  rewrite    leans on an undefined term or reference (85%), hard to follow on first reading (82%)
  shorten    45 words

web/layers/auth/app/pages/muj-ucet.vue:56-61
  Vue renders siblings in order, so `<AccountBilling>` would not even dispatch…
  rewrite    hard to follow on first reading (79%)
  shorten    76 words

web/layers/auth/app/pages/muj-ucet.vue:102
  Saves a round-trip; the route enforces it again.
  duplicate  also at web/layers/auth/app/pages/obnova-hesla.vue:102, web/layers/auth/app/pages/registrace.vue:73, web/layers/shop/app/components/checkout/RegisterForm.vue:57

web/layers/auth/app/pages/obnova-hesla.vue:61
  Bare title: the page is `robots: false`, so no og:* tags.
  duplicate  also at web/layers/auth/app/pages/prihlaseni.vue:55, web/layers/auth/app/pages/registrace.vue:55

web/layers/auth/app/pages/obnova-hesla.vue:70-71
  With a token from the e-mail the page sets a password; without one it…
  remove     restates the code (90%); a reader would not have wondered about the code (64%)

web/layers/auth/app/pages/obnova-hesla.vue:84
  Normalised here too, so the confirmation names what Directus was given.
  duplicate  also at web/layers/auth/app/pages/registrace.vue:68, web/layers/shop/app/components/checkout/RegisterForm.vue:51

web/layers/auth/app/pages/obnova-hesla.vue:102
  Saves a round-trip; the route enforces it again.
  remove     answers a question the reader would not ask (71%); it is a reason, not a description (96%)
  duplicate  also at web/layers/auth/app/pages/muj-ucet.vue:102, web/layers/auth/app/pages/registrace.vue:73, web/layers/shop/app/components/checkout/RegisterForm.vue:57

web/layers/auth/app/pages/overeni-emailu.vue:42-44
  Back to the Checkout this Account was on, where step 1 asks for the…
  rewrite    leans on an undefined term or reference (85%)

web/layers/auth/app/pages/prihlaseni.vue:55
  Bare title: the page is `robots: false`, so no og:* tags.
  remove     answers a question the reader would not ask (64%); it is a reason, not a description (94%)
  duplicate  also at web/layers/auth/app/pages/obnova-hesla.vue:61, web/layers/auth/app/pages/registrace.vue:55

web/layers/auth/app/pages/prihlaseni.vue:62
  Both /overeni-emailu and /obnova-hesla send the Account here and say why.
  remove     answers a question the reader would not ask (61%); it is a reason, not a description (56%)

web/layers/auth/app/pages/prihlaseni.vue:79-85
  A visitor sent here from a Checkout has no `?redirect=` when the…
  rewrite    hard to follow on first reading (84%)
  shorten    78 words

web/layers/auth/app/pages/registrace.vue:55
  Bare title: the page is `robots: false`, so no og:* tags.
  duplicate  also at web/layers/auth/app/pages/obnova-hesla.vue:61, web/layers/auth/app/pages/prihlaseni.vue:55

web/layers/auth/app/pages/registrace.vue:68
  Normalised here too, so the confirmation names what Directus was given.
  duplicate  also at web/layers/auth/app/pages/obnova-hesla.vue:84, web/layers/shop/app/components/checkout/RegisterForm.vue:51

web/layers/auth/app/pages/registrace.vue:73
  Saves a round-trip; the route enforces it again.
  remove     answers a question the reader would not ask (60%); it is a reason, not a description (97%)
  duplicate  also at web/layers/auth/app/pages/muj-ucet.vue:102, web/layers/auth/app/pages/obnova-hesla.vue:102, web/layers/shop/app/components/checkout/RegisterForm.vue:57

web/layers/auth/nuxt.config.ts:1-4
  nuxt-robots augments NitroRouteConfig with `robots` only for the app…
  duplicate  also at web/layers/shop/nuxt.config.ts:1

web/layers/auth/nuxt.config.ts:6
  Registers this directory as a layer; owns the identity lifecycle (area 02).
  remove     answers a question the reader would not ask (68%); it is a reason, not a description (61%)

web/layers/auth/server/api/auth/password-reset.post.ts:4
  Does not log in: the page sends the Account to the login form instead.
  remove     restates the code (72%); a reader would not have wondered about the code (41%)

web/layers/auth/server/middleware/account-session.ts:1-8
  Keeps a live session's Directus tokens (and the cookie's 30-day window)…
  rewrite    hard to follow on first reading (81%)
  shorten    59 words

web/layers/auth/server/utils/account-session.ts:1-2
  Credentials in, a sealed cookie out, and the transparent refresh that keeps…
  rewrite    leans on an undefined term or reference (87%)

web/layers/auth/server/utils/account-session.ts:14-15
  The session caches the lowercased e-mail: the Student policy reads their own…
  remove     answers a question the reader would not ask (61%); it is a reason, not a description (99%)

web/layers/auth/server/utils/account-session.ts:43-47
  The one place a password goes to Directus. Null means Directus rejected the…
  shorten    55 words

web/layers/auth/server/utils/account-session.ts:162-164
  Bound to the Account's own session, so gated reads and writes inherit…
  remove     answers a question the reader would not ask (60%); it is a reason, not a description (91%)

web/layers/auth/server/utils/caller-client.ts:3-7
  An optionally-authenticated read (ADR 0004): the caller's own session when…
  rewrite    leans on an undefined term or reference (86%), hard to follow on first reading (77%)
  shorten    59 words

web/layers/auth/server/utils/password-change.ts:26-30
  Directus deletes every session of a user whose password changed, sparing…
  rewrite    hard to follow on first reading (82%)
  shorten    52 words

web/layers/auth/server/utils/password-change.ts:48-53
  `PATCH /users/<id>`, not `/users/me`. Both work today: the Student policy…
  rewrite    leans on an undefined term or reference (81%), hard to follow on first reading (83%)
  shorten    73 words

web/layers/auth/server/utils/password-reset.ts:24
  A missing token is a dead link like any other.
  remove     answers a question the reader would not ask (79%); it is a reason, not a description (68%)
  duplicate  also at web/layers/auth/server/utils/registration.ts:28

web/layers/auth/server/utils/password-reset.ts:59-62
  Expired, used and forged tokens need not share a Directus code, and the…
  rewrite    hard to follow on first reading (80%)
  shorten    44 words

web/layers/auth/server/utils/rate-limit.ts:1-7
  Per-IP guard for the unauthenticated auth routes. Directus's own…
  rewrite    leans on an undefined term or reference (83%)
  shorten    51 words

web/layers/auth/server/utils/rate-limit.ts:12
  Above this many tracked IPs, drop the ones whose window has passed.
  remove     restates the code (90%); a reader would not have wondered about the code (49%)

web/layers/auth/server/utils/registration.ts:28
  A missing token is a dead link like any other.
  remove     answers a question the reader would not ask (74%); it is a reason, not a description (86%)
  duplicate  also at web/layers/auth/server/utils/password-reset.ts:24

web/layers/auth/server/utils/registration.ts:37-41
  Directus answers 204 whether the address was free or already taken, so…
  rewrite    leans on an undefined term or reference (81%), hard to follow on first reading (80%)
  shorten    50 words

web/layers/auth/shared/types/account.ts:1-6
  An Account is a Directus identity that can log in, whoever holds it: a…
  shorten    74 words

web/layers/auth/shared/types/account.ts:11
  Never leaves the server (ADR 0002).
  rewrite    leans on an undefined term or reference (82%)

web/layers/auth/shared/types/account.ts:15
  Epoch ms. Directus access tokens last 15 minutes (probe).
  remove     answers a question the reader would not ask (64%); it is a reason, not a description (64%)

web/layers/auth/shared/utils/auth-messages.ts:15
  Must agree with PASSWORD_MIN_LENGTH; tests/unit/password.test.ts checks.
  remove     answers a question the reader would not ask (61%); it is a reason, not a description (99%)

web/layers/auth/shared/utils/redirects.ts:1
  Where an Account ends up after logging in without an origin.
  remove     answers a question the reader would not ask (65%); it is a reason, not a description (49%)

web/layers/directus/nuxt.config.ts:1-3
  Marker so Nuxt registers this directory as a layer. The layer owns all…
  remove     answers a question the reader would not ask (60%); it is a reason, not a description (87%)

web/layers/directus/server/utils/directus-server.ts:7-9
  Exactly the public role's access, and the only client the auth routes may…
  rewrite    hard to follow on first reading (76%)

web/layers/directus/shared/types/directus.ts:16
  Wire shape of `articles` collection in Directus.
  remove     restates the code (95%); a reader would not have wondered about the code (86%)

web/layers/directus/shared/types/directus.ts:90-92
  A Consent as it is created: the id and the parent are Directus's to fill in…
  rewrite    hard to follow on first reading (77%)

web/layers/directus/shared/types/directus.ts:101-105
  The `directus_users` columns this app touches. Naming the collection in the…
  rewrite    hard to follow on first reading (77%)
  shorten    56 words

web/layers/directus/shared/utils/directus.ts:7
  Pure factory — no Vue/Nitro APIs, usable from both app and server code.
  remove     answers a question the reader would not ask (76%); it is a reason, not a description (90%)

web/layers/directus/shared/utils/directus.ts:12
  Whose token it is, and where it came from, is not this layer's business.
  remove     answers a question the reader would not ask (67%); it is a reason, not a description (99%)

web/layers/directus/shared/utils/schemas.ts:3-6
  Wire codecs: parse Directus responses and normalise null → undefined so…
  shorten    41 words

web/layers/directus/shared/utils/schemas.ts:8-9
  Subset of the `directus_files` columns the app actually consumes. `id` is…
  remove     answers a question the reader would not ask (64%); it is a reason, not a description (52%)

web/layers/directus/shared/utils/schemas.ts:26
  Consumer contract: optional keys (omitted when null on the wire).
  remove     restates the code (83%); a reader would not have wondered about the code (66%)

web/layers/directus/shared/utils/schemas.ts:50-56
  Consumer contract: the Course statuses the shop deals in. `published` is…
  rewrite    leans on an undefined term or reference (87%)
  shorten    78 words

web/layers/directus/shared/utils/schemas.ts:61
  Consumer contract: the public catalog shape of a published Course.
  remove     restates the code (95%); a reader would not have wondered about the code (80%)

web/layers/directus/shared/utils/schemas.ts:92
  Consumer contract: Section outline. `course` is the parent's id.
  remove     restates the code (94%); a reader would not have wondered about the code (84%)

web/layers/directus/shared/utils/schemas.ts:143-144
  Consumer contract: an Order as its owning Student (or the server flows)…
  remove     restates the code (88%); a reader would not have wondered about the code (79%)

web/layers/directus/shared/utils/schemas.ts:175-176
  Consumer contract: one consent record of an Order. `order` is the parent's…
  remove     restates the code (88%); a reader would not have wondered about the code (78%)

web/layers/lms/nuxt.config.ts:1-2
  Marker so Nuxt registers this directory as a layer. Owns course view,…
  rewrite    leans on an undefined term or reference (82%)

web/layers/shop/app/components/account/Billing.vue:28-35
  „Fakturační údaje" on the Account page (spec, user story 21): the same form…
  rewrite    leans on an undefined term or reference (84%)
  shorten    71 words

web/layers/shop/app/components/account/Billing.vue:41-44
  A copy, spread rather than aliased: `<BillingDetailsForm>` writes into this…
  shorten    49 words

web/layers/shop/app/components/account/Billing.vue:64-65
  The panel's own flow does not reach inside a section, so the heading, the…
  remove     answers a question the reader would not ask (64%); it is a reason, not a description (92%)

web/layers/shop/app/components/account/MyCourses.vue:23-24
  Until area 06 ships the player there is nowhere to send them,…
  rewrite    leans on an undefined term or reference (83%)

web/layers/shop/app/components/account/MyCourses.vue:36-42
  „Moje kurzy" on the Account page (spec, user story 19). A shop-layer…
  rewrite    leans on an undefined term or reference (83%)
  shorten    69 words

web/layers/shop/app/components/account/MyCourses.vue:45-46
  A failure is its own branch below; the list itself is never null, so the…
  remove     answers a question the reader would not ask (63%); it is a reason, not a description (93%)

web/layers/shop/app/components/account/MyCourses.vue:50-51
  One sentence for every failure: nothing here is the Student's doing and…
  remove     answers a question the reader would not ask (69%); it is a reason, not a description (92%)

web/layers/shop/app/components/account/MyCourses.vue:60-61
  The panel's own flow does not reach inside a section, so the heading and…
  remove     answers a question the reader would not ask (73%); it is a reason, not a description (96%)

web/layers/shop/app/components/billing/DetailsForm.vue:90-96
  The Billing Details, wherever they are being edited: step 2 of the Checkout…
  shorten    73 words

web/layers/shop/app/components/billing/DetailsForm.vue:117-118
  Puleo gives every `details` a surface and the site's pill radius, which…
  rewrite    leans on an undefined term or reference (83%)

web/layers/shop/app/components/catalog/CourseCard.vue:5-7
  Only an Author's own session ever carries a draft here (ADR 0004);…
  rewrite    leans on an undefined term or reference (85%)

web/layers/shop/app/components/checkout/AccountStep.vue:37-38
  They came back from the verification link, so the address is known and…
  rewrite    leans on an undefined term or reference (87%)

web/layers/shop/app/components/checkout/AccountStep.vue:44-46
  „Zkontrolujte e-mail", for as long as this tab stays open. A reload is a…
  shorten    42 words

web/layers/shop/app/components/checkout/GuestPanel.vue:6-9
  `role="tablist"` is a promise the rest of the widget has to keep: each…
  shorten    52 words

web/layers/shop/app/components/checkout/GuestPanel.vue:48-50
  Back from the verification link there is a password to type and an account…
  rewrite    leans on an undefined term or reference (86%)

web/layers/shop/app/components/checkout/GuestPanel.vue:55-62
  Arrow keys wrap, as a tablist is expected to. The strip only ever holds two…
  shorten    92 words

web/layers/shop/app/components/checkout/GuestPanel.vue:84-85
  Narrow enough to keep each label on one line; at phone width the strip…
  remove     answers a question the reader would not ask (62%); it is a reason, not a description (99%)

web/layers/shop/app/components/checkout/LogInForm.vue:27-28
  Wrapped: the design system lays every `form` out as a grid, and a bare…
  duplicate  also at web/layers/shop/app/components/checkout/RegisterForm.vue:24

web/layers/shop/app/components/checkout/LogInForm.vue:42-44
  „Mám účet": the login page's form, inside step 1 of the Checkout. Same…
  remove     answers a question the reader would not ask (68%); it is a reason, not a description (96%)

web/layers/shop/app/components/checkout/LogInForm.vue:46-47
  Back from the verification link: the address is known and the button says…
  rewrite    leans on an undefined term or reference (84%)

web/layers/shop/app/components/checkout/OrderForm.vue:3-4
  The title is interpolated, not markup, so the non-breaking space is…
  remove     answers a question the reader would not ask (61%); it is a reason, not a description (96%)

web/layers/shop/app/components/checkout/OrderForm.vue:48-51
  Steps 2 and 3 of the Checkout, for a Student whose step 1 is done. One form…
  remove     answers a question the reader would not ask (66%); it is a reason, not a description (91%)
  shorten    44 words

web/layers/shop/app/components/checkout/OrderForm.vue:55
  Pre-filled from the Account, so a returning Student only checks them.
  remove     answers a question the reader would not ask (70%); it is a reason, not a description (57%)

web/layers/shop/app/components/checkout/OrderForm.vue:59-60
  The Student's own draft: nothing outside this form reads it, and it is only…
  remove     answers a question the reader would not ask (68%); it is a reason, not a description (98%)

web/layers/shop/app/components/checkout/OrderForm.vue:68-69
  The same pending/error pair every form on this site uses, error messages…
  remove     answers a question the reader would not ask (80%); it is a reason, not a description (77%)

web/layers/shop/app/components/checkout/OrderForm.vue:101-104
  Not a sizing workaround — the design system sizes the box itself. The…
  rewrite    hard to follow on first reading (77%)
  shorten    54 words

web/layers/shop/app/components/checkout/Recap.vue:18-21
  What is being bought, alongside the steps the whole way down — the point of…
  remove     answers a question the reader would not ask (82%); it is a reason, not a description (91%)
  shorten    47 words

web/layers/shop/app/components/checkout/Recap.vue:49-50
  The stylesheet drops list markers site-wide, so an indent would only leave…
  remove     answers a question the reader would not ask (60%); it is a reason, not a description (100%)

web/layers/shop/app/components/checkout/RegisterForm.vue:17-18
  ADR 0005: the second password prompt is a wart, so it is at least…
  rewrite    leans on an undefined term or reference (85%)

web/layers/shop/app/components/checkout/RegisterForm.vue:24-25
  Wrapped: the design system lays every `form` out as a grid, and a bare…
  duplicate  also at web/layers/shop/app/components/checkout/LogInForm.vue:27

web/layers/shop/app/components/checkout/RegisterForm.vue:51
  Normalised here too, so the confirmation names what Directus was given.
  duplicate  also at web/layers/auth/app/pages/obnova-hesla.vue:84, web/layers/auth/app/pages/registrace.vue:68

web/layers/shop/app/components/checkout/RegisterForm.vue:57
  Saves a round-trip; the route enforces it again.
  remove     answers a question the reader would not ask (60%); it is a reason, not a description (97%)
  duplicate  also at web/layers/auth/app/pages/muj-ucet.vue:102, web/layers/auth/app/pages/obnova-hesla.vue:102, web/layers/auth/app/pages/registrace.vue:73

web/layers/shop/app/components/CourseCover.vue:12-17
  The one place a Course cover becomes an `<img>`: the Catalog card and the…
  remove     answers a question the reader would not ask (68%); it is a reason, not a description (100%)
  shorten    65 words

web/layers/shop/app/components/sales/Bespoke.vue:6-8
  The slot between hero and outline: the Course's hand-built copy when the…
  remove     answers a question the reader would not ask (73%); it is a reason, not a description (83%)

web/layers/shop/app/components/sales/content/TestKurzPublikovany.vue:50-53
  Hand-built sales copy for the `[TEST]` fixture Course, mounted by the…
  remove     answers a question the reader would not ask (71%); it is a reason, not a description (92%)
  shorten    43 words

web/layers/shop/app/components/sales/Offer.vue:22-29
  The Sales Page's one call to action, in its three states (spec,…
  rewrite    hard to follow on first reading (82%)
  shorten    84 words

web/layers/shop/app/components/sales/Outline.vue:24-26
  How a video and a text Lesson tell apart in the outline: an icon for the…
  remove     answers a question the reader would not ask (66%); it is a reason, not a description (80%)
  shorten    42 words

web/layers/shop/app/components/ShopNotice.vue:8-17
  The shop's one notice. The auth layer has `<AuthFormError>`, which only ever…
  shorten    108 words

web/layers/shop/app/components/ShopNotice.vue:25
  A slot always wins: a caller that passes one means to show it.
  remove     answers a question the reader would not ask (63%); it is a reason, not a description (76%)

web/layers/shop/app/composables/checkout-email.ts:4-13
  The address this browser registered with in step 1 of a Checkout, so the…
  rewrite    leans on an undefined term or reference (82%), hard to follow on first reading (85%)
  shorten    105 words

web/layers/shop/app/pages/kurzy/[slug].vue:33-35
  Through Nitro, never Directus from the browser (ADR 0004): the route reads…
  rewrite    leans on an undefined term or reference (85%)

web/layers/shop/app/pages/kurzy/[slug].vue:48-53
  Head and structured data derive from the Course itself (spec, "Metadata…
  rewrite    leans on an undefined term or reference (83%)
  shorten    66 words

web/layers/shop/app/pages/kurzy/index.vue:22-23
  The site's title template and canonical link come from nuxt-seo-utils'…
  remove     answers a question the reader would not ask (62%); it is a reason, not a description (95%)

web/layers/shop/app/pages/kurzy/index.vue:29-30
  Through Nitro, never Directus from the browser (ADR 0004): the route reads…
  rewrite    leans on an undefined term or reference (81%)

web/layers/shop/app/pages/objednavka/[id]/navrat.vue:6-9
  The title is empty for a Course the Student may no longer read, and…
  shorten    41 words

web/layers/shop/app/pages/objednavka/[id]/navrat.vue:31-33
  Where GoPay sends the Student back. The route settles the Payment on the…
  rewrite    leans on an undefined term or reference (84%)

web/layers/shop/app/pages/objednavka/[id]/navrat.vue:65-67
  True while the page is still re-asking; false once it has given up and…
  remove     restates the code (73%); a reader would not have wondered about the code (45%)

web/layers/shop/app/pages/objednavka/[id]/navrat.vue:70
  Non-breaking spaces as characters, not entities: this is text, not markup.
  remove     answers a question the reader would not ask (76%); it is a reason, not a description (88%)

web/layers/shop/app/pages/objednavka/[id]/navrat.vue:88-91
  Two timers, both VueUse's, so there is one answer to „when does this stop…
  shorten    49 words

web/layers/shop/app/pages/objednavka/[slug].vue:56-59
  Three steps on one page with the Course alongside (prototype, variant C).…
  rewrite    leans on an undefined term or reference (83%)
  shorten    52 words

web/layers/shop/app/pages/objednavka/[slug].vue:64-66
  Through Nitro, never Directus from the browser (ADR 0004). The route decides…
  rewrite    leans on an undefined term or reference (84%)

web/layers/shop/app/pages/objednavka/[slug].vue:75-76
  The verification landing sends the Account back here with the same flag it…
  rewrite    leans on an undefined term or reference (81%)

web/layers/shop/app/pages/objednavka/[slug].vue:79-86
  A 409 is a Course this Student may not buy, which the page says in its own…
  rewrite    leans on an undefined term or reference (81%), hard to follow on first reading (80%)
  shorten    88 words

web/layers/shop/app/pages/objednavka/[slug].vue:99-103
  Step 1 is done: ask the route again, which now answers with the Student's…
  rewrite    leans on an undefined term or reference (81%)
  shorten    67 words

web/layers/shop/app/utils/page-error.ts:1-6
  A Nitro refusal that the page has no better answer for, turned into the…
  shorten    75 words

web/layers/shop/app/utils/pending-checkout.ts:1-11
  The browser's half of the pending-checkout cookie. It is `httpOnly`, so the…
  shorten    116 words

web/layers/shop/app/utils/sales-content.ts:4-14
  Which Courses carry hand-built sales copy (spec, "Where content lives"):…
  shorten    103 words

web/layers/shop/mock-gopay/app/pages/platba-mock/[id].vue:75-76
  The browser's own `dd` indent and the stylesheet's vertical rhythm both…
  remove     answers a question the reader would not ask (76%); it is a reason, not a description (81%)

web/layers/shop/mock-gopay/nuxt.config.ts:6-10
  The mock payment gateway, a layer of its own so that whether it exists at…
  rewrite    hard to follow on first reading (76%)
  shorten    63 words

web/layers/shop/mock-gopay/server/api/gopay/mock/payments.post.ts:8-11
  Creates a Payment at the mock gateway the way the Checkout will, so the…
  shorten    51 words

web/layers/shop/mock-gopay/server/api/gopay/mock/payments/[id].get.ts:1-3
  This layer is in the build only in mock mode, so Nuxt's auto-imports are…
  shorten    42 words

web/layers/shop/mock-gopay/server/api/gopay/mock/payments/[id].get.ts:9
  What the mock gateway page shows: the Payment as the mock recorded it.
  remove     restates the code (100%); a reader would not have wondered about the code (75%)

web/layers/shop/mock-gopay/server/api/gopay/mock/payments/[id]/decide.post.ts:17-30
  „Zaplatit" and „Zrušit" — the only two things a payer can do at this…
  shorten    140 words

web/layers/shop/nuxt.config.ts:1-4
  nuxt-robots augments NitroRouteConfig with `robots` only for the app…
  duplicate  also at web/layers/auth/nuxt.config.ts:1

web/layers/shop/nuxt.config.ts:12-17
  The mock gateway exists only in mock mode (spec, „Mock gateway"), so a…
  rewrite    hard to follow on first reading (80%)
  shorten    69 words

web/layers/shop/server/api/__sitemap__/courses.get.ts:3-12
  The sitemap's runtime source (spec, "Metadata and structured data"):…
  shorten    93 words

web/layers/shop/server/api/account/billing.get.ts:3-6
  „Fakturační údaje" on the Account page, pre-filled. The same read the…
  remove     answers a question the reader would not ask (64%); it is a reason, not a description (72%)

web/layers/shop/server/api/account/billing.post.ts:5-12
  „Fakturační údaje" saved outside a purchase (spec, user story 21). The…
  shorten    79 words

web/layers/shop/server/api/account/courses.get.ts:3-7
  „Moje kurzy" on the Account page: the Courses this Student owns. The read…
  remove     answers a question the reader would not ask (63%); it is a reason, not a description (91%)
  shorten    58 words

web/layers/shop/server/api/checkout/[slug].get.ts:4-10
  What the Checkout page needs to render itself for whoever asked. Every…
  rewrite    leans on an undefined term or reference (84%)
  shorten    79 words

web/layers/shop/server/api/checkout/[slug].post.ts:5-11
  „Objednávka zavazující k platbě". The answer is the gateway URL the browser…
  shorten    72 words

web/layers/shop/server/api/checkout/[slug].post.ts:25-27
  Two things a Student can get wrong, and each has to be told apart: the…
  shorten    41 words

web/layers/shop/server/api/courses.get.ts:3-4
  The Catalog (spec, "Scope of the Catalog"): every Course in a shop…
  remove     restates the code (87%); a reader would not have wondered about the code (63%)

web/layers/shop/server/api/courses/[slug].get.ts:1-8
  The Sales Page (spec, "Routes and navigation"). The caller's own session…
  rewrite    leans on an undefined term or reference (83%)
  shorten    75 words

web/layers/shop/server/api/gopay/notify.get.ts:4-7
  GoPay's server-to-server notification: a bare GET carrying only the Payment…
  shorten    53 words

web/layers/shop/server/api/pending-checkout.post.ts:1-4
  Hands the pending Checkout's slug to the login page and the verification…
  shorten    43 words

web/layers/shop/server/middleware/pending-checkout.ts:3-11
  Remembers which Checkout a visitor without an Account is on, so the…
  rewrite    leans on an undefined term or reference (84%), hard to follow on first reading (82%)
  shorten    88 words

web/layers/shop/server/middleware/pending-checkout.ts:27
  Logged in on the Checkout: there is nothing left to come back to.
  remove     answers a question the reader would not ask (65%); it is a reason, not a description (49%)

web/layers/shop/server/utils/account-billing.ts:6-9
  The Billing Details as they sit on the Account, read by both places that…
  shorten    47 words

web/layers/shop/server/utils/checkout-order.ts:10-15
  Everything the Checkout does to Directus and to GoPay, so the two routes…
  rewrite    leans on an undefined term or reference (90%), hard to follow on first reading (83%)
  shorten    72 words

web/layers/shop/server/utils/checkout-order.ts:38-40
  A Course a Student may actually buy. Absent is 404 — the same 404 as a slug…
  rewrite    leans on an undefined term or reference (85%)
  shorten    44 words

web/layers/shop/server/utils/checkout-order.ts:78-82
  A Student who walked away from the gateway and came back gets the same…
  shorten    61 words

web/layers/shop/server/utils/checkout-order.ts:99-102
  The empty string is checked as carefully as `undefined`: GoPay answers an…
  shorten    51 words

web/layers/shop/server/utils/checkout-order.ts:109-112
  The Order and its Consent in one write, by the Student's own session: the…
  shorten    49 words

web/layers/shop/server/utils/checkout-order.ts:133-136
  The Payment, and the one write the Student is not allowed to make. The…
  shorten    52 words

web/layers/shop/server/utils/checkout-order.ts:163-166
  Stamped first, refused second: a Payment GoPay created but gave us no page…
  shorten    50 words

web/layers/shop/server/utils/checkout-order.ts:180-182
  „Objednávka zavazující k platbě": the Billing Details land on the Account,…
  remove     restates the code (87%); a reader would not have wondered about the code (60%)

web/layers/shop/server/utils/checkout-order.ts:193-196
  Remembered for next time (spec, user story 7). The Order keeps its own…
  rewrite    leans on an undefined term or reference (84%)
  shorten    48 words

web/layers/shop/server/utils/course-query.ts:11-15
  The Course columns both routes select. Kept in one place: `CourseSchema`…
  shorten    55 words

web/layers/shop/server/utils/course-query.ts:26-33
  The statuses the shop asks Directus for (spec, "Scope of the Catalog"),…
  rewrite    leans on an undefined term or reference (85%), hard to follow on first reading (80%)
  shorten    92 words

web/layers/shop/server/utils/course-query.ts:48-54
  One Course by slug for the whole shop — the Sales Page and the Checkout —…
  rewrite    leans on an undefined term or reference (87%), hard to follow on first reading (82%)
  shorten    89 words

web/layers/shop/server/utils/entitlements.ts:6-10
  Every read of „what does this caller own". Always with the caller's own…
  rewrite    leans on an undefined term or reference (83%)
  shorten    53 words

web/layers/shop/server/utils/entitlements.ts:12-13
  Whether the caller already owns this Course. The filter on `course` is the…
  remove     restates the code (71%); a reader would not have wondered about the code (53%)

web/layers/shop/server/utils/entitlements.ts:24-26
  „Moje kurzy": the caller's Entitlements with the Course expanded. The…
  remove     restates the code (90%); a reader would not have wondered about the code (56%)

web/layers/shop/server/utils/gopay-api-client.ts:44-45
  The token the other three calls ride on, kept for as long as GoPay says it…
  remove     restates the code (81%); a reader would not have wondered about the code (57%)

web/layers/shop/server/utils/gopay-api-client.ts:48-51
  The fetch itself, not its result: at a cold start, and again at every…
  shorten    48 words

web/layers/shop/server/utils/gopay-client.ts:7-11
  The one place that decides which GoPay the site talks to. Everything else…
  shorten    49 words

web/layers/shop/server/utils/gopay-mock-client.ts:8-12
  A GoPay stand-in that never leaves the machine, so the whole payment can be…
  shorten    61 words

web/layers/shop/server/utils/gopay-mock-client.ts:27
  The gateway page for a Payment. Only mounted in a non-production build.
  remove     restates the code (82%); a reader would not have wondered about the code (70%)

web/layers/shop/server/utils/gopay-mock-client.ts:42-43
  What „Zaplatit" and „Zrušit" do to a Payment. Unknown id answers…
  remove     restates the code (93%); a reader would not have wondered about the code (58%)

web/layers/shop/server/utils/order-return.ts:10-13
  What the Student sees when GoPay sends them back. The Order is read with…
  rewrite    leans on an undefined term or reference (82%)
  shorten    49 words

web/layers/shop/server/utils/order-return.ts:15-18
  The return page polls this every three seconds for half a minute, and every…
  shorten    49 words

web/layers/shop/server/utils/order-return.ts:36-40
  `readFirstRow`, not `readOnlyRow`: a Course turned back into a draft or…
  shorten    65 words

web/layers/shop/server/utils/order-return.ts:56-60
  The Student usually arrives before GoPay's notification does, so the page…
  shorten    57 words

web/layers/shop/server/utils/read-row.ts:9
  The row, or `undefined` when the filter matched nothing.
  remove     restates the code (100%); a reader would not have wondered about the code (73%)

web/layers/shop/server/utils/read-row.ts:18-19
  The row, or the shop's 404 — which is what makes a row the caller may not…
  rewrite    leans on an undefined term or reference (84%)

web/layers/shop/server/utils/settle-payment.ts:9-16
  The one place where money turns into access (spec, „Settlement"). Both the…
  rewrite    leans on an undefined term or reference (81%)
  shorten    79 words

web/layers/shop/server/utils/settle-payment.ts:66
  What the Payment's state does to the Order, and only ever the difference.
  remove     restates the code (72%); a reader would not have wondered about the code (51%)

web/layers/shop/server/utils/settle-payment.ts:84-86
  Area 10's § 1824a confirmation e-mail (spec, user story 34) goes here,…
  rewrite    leans on an undefined term or reference (85%)

web/layers/shop/server/utils/settle-payment.ts:96
  The Order as it stands after settling: its status is the outcome.
  remove     restates the code (98%); a reader would not have wondered about the code (79%)

web/layers/shop/server/utils/settle-payment.ts:100-103
  `undefined` means no Order carries this Payment id: a forged notification,…
  shorten    44 words

web/layers/shop/server/utils/settle-payment.ts:118-122
  No Payment to ask about, or an Order already in its terminal state, in…
  rewrite    hard to follow on first reading (76%)
  shorten    63 words

web/layers/shop/server/utils/shop-errors.ts:1-4
  The shop's answer to `authError`: one error shape for the Checkout, the…
  shorten    43 words

web/layers/shop/server/utils/shop-errors.ts:9-12
  Absent is 404, worded like Nuxt's own route miss: a draft Course and…
  rewrite    leans on an undefined term or reference (85%), hard to follow on first reading (79%)
  shorten    42 words

web/layers/shop/server/utils/shop-service-client.ts:3-11
  The third server client, next to the anonymous one (directus layer) and the…
  rewrite    leans on an undefined term or reference (82%), hard to follow on first reading (82%)
  shorten    93 words

web/layers/shop/shared/utils/catalog-order.ts:1-4
  Catalog order (spec, "Read path"): `sort` ascending, a course with no…
  shorten    45 words

web/layers/shop/shared/utils/checkout.ts:5-7
  The Checkout's vocabulary, pure so the page, the Nitro routes and the tests…
  remove     answers a question the reader would not ask (62%); it is a reason, not a description (78%)

web/layers/shop/shared/utils/checkout.ts:34-46
  What a browser may send as Billing Details, wherever it sends them from:…
  rewrite    hard to follow on first reading (84%)
  shorten    142 words

web/layers/shop/shared/utils/checkout.ts:66-67
  A Directus row (or a request body) in, a form-ready object out: anything…
  remove     restates the code (90%); a reader would not have wondered about the code (47%)

web/layers/shop/shared/utils/checkout.ts:113-116
  The terms' effective date, which is what the Order records as the version…
  rewrite    leans on an undefined term or reference (83%)

web/layers/shop/shared/utils/checkout.ts:126-129
  An Order of this Student for this Course that still has a Payment to go…
  shorten    53 words

web/layers/shop/shared/utils/checkout.ts:136-141
  A refusal a page knows how to render itself, dug out of whatever `$fetch`…
  rewrite    hard to follow on first reading (78%)
  shorten    69 words

web/layers/shop/shared/utils/gopay.ts:5-8
  The vocabulary of the payment gateway, in one place: the states GoPay can…
  remove     answers a question the reader would not ask (60%); it is a reason, not a description (86%)
  shorten    51 words

web/layers/shop/shared/utils/gopay.ts:36-39
  What a Payment in this state means for the Order that owns it.…
  shorten    50 words

web/layers/shop/shared/utils/gopay.ts:59-60
  A Payment as the rest of the shop sees it: the id we stamp on the Order,…
  remove     restates the code (89%); a reader would not have wondered about the code (76%)

web/layers/shop/shared/utils/gopay.ts:67-71
  Everything a Payment needs that this area's code knows and the gateway…
  rewrite    leans on an undefined term or reference (84%)
  shorten    60 words

web/layers/shop/shared/utils/lesson-count.ts:3-5
  „1 lekce", „2–4 lekce", „5+ lekcí" (and „0 lekcí"). The count is a whole…
  remove     answers a question the reader would not ask (65%); it is a reason, not a description (87%)

web/layers/shop/shared/utils/og-image.ts:1-9
  The social preview of a Sales Page is the cover put through a Directus…
  shorten    87 words

web/layers/shop/shared/utils/owned-courses.ts:6-8
  What „Moje kurzy" is made of: the Courses a Student holds an Entitlement…
  remove     answers a question the reader would not ask (66%); it is a reason, not a description (68%)

web/layers/shop/shared/utils/owned-courses.ts:10-12
  Where „Moje kurzy" lives. The Sales Page sends an owner straight to the…
  remove     answers a question the reader would not ask (63%); it is a reason, not a description (99%)

web/layers/shop/shared/utils/owned-courses.ts:23-27
  The Entitlement rows as the route asks for them, with the Course expanded.…
  shorten    57 words

web/layers/shop/shared/utils/owned-courses.ts:33-37
  Rows in, a renderable list out. An Entitlement whose Course is unreadable…
  shorten    62 words

web/layers/shop/shared/utils/pending-checkout.ts:3-7
  The Checkout a visitor without an Account left behind, so registering,…
  rewrite    leans on an undefined term or reference (84%)
  shorten    63 words

web/layers/shop/shared/utils/pending-checkout.ts:15-19
  Deliberately about separators rather than about spelling: a slug the CMS…
  shorten    57 words

web/layers/shop/shared/utils/pending-checkout.ts:26-27
  The Checkout a stored slug points at, or null for anything else — an empty…
  remove     restates the code (97%); a reader would not have wondered about the code (51%)

web/layers/shop/shared/utils/pending-checkout.ts:42-45
  Where an Account goes once they are logged in: an explicit `?redirect=`…
  shorten    47 words

web/layers/shop/shared/utils/price.ts:3-11
  The one place a price becomes text (spec, "Price"): a price typed into…
  shorten    83 words

web/layers/shop/shared/utils/sales.ts:7-11
  What the Sales Page route returns: the public Course shape and the full…
  rewrite    leans on an undefined term or reference (84%)
  shorten    67 words

web/layers/shop/shared/utils/sales.ts:20-24
  What the Sales Page route answers: the Course, plus the one thing about it…
  shorten    63 words

web/layers/shop/shared/utils/settlement.ts:18-25
  What the return route answers and the return page renders: the outcome, and…
  shorten    94 words
```

## `web/server`, `web/shared`, `web/tests`, `scripts`

```
web/server/runtime-config.schema.ts:1-3
  Runtime config schema for the @lttr/nuxt-validated-runtime-config module. See…
  remove   restates the code (71%); a reader would not have wondered about the code (53%)

web/server/runtime-config.schema.ts:57-59
  The Shop Service Account's static Directus token (ADR 0006). Without it…
  rewrite  leans on an undefined term or reference (82%)

web/shared/utils/ignored-hostnames.ts:1-9
  Hosts whose traffic must never reach analytics or ad tools: local development…
  shorten  66 words

web/tests/probes/app-server.ts:6-12
  The flow tests' seam: a real Nuxt server, driven with raw `fetch`. The…
  shorten  76 words

web/tests/probes/app-server.ts:85
  Already gone; nothing to stop.
  remove   answers a question the reader would not ask (61%); it is a reason, not a description (59%)

web/tests/probes/app-server.ts:100-101
  One browser's worth of cookies, which is all a flow test needs: the session…
  remove   answers a question the reader would not ask (66%); it is a reason, not a description (84%)

web/tests/probes/auth.probe.ts:17
  The app's own constant, so the probe proves it still matches the instance.
  remove   answers a question the reader would not ask (62%); it is a reason, not a description (96%)

web/tests/probes/auth.probe.ts:66
  The URLs the app asks Directus to put in its e-mails (see authPageUrl).
  remove   answers a question the reader would not ask (65%); it is a reason, not a description (57%)

web/tests/probes/auth.probe.ts:70-73
  Directus rate-limits the e-mail-sending endpoints per IP itself: a burst of…
  shorten  45 words

web/tests/probes/auth.probe.ts:89-90
  `verification_url` is omitted except where the test is about it, so the…
  rewrite  leans on an undefined term or reference (84%)

web/tests/probes/auth.probe.ts:298
  The route only ever writes as the logged-in Student.
  remove   restates the code (73%); a reader would not have wondered about the code (53%)

web/tests/probes/auth.probe.ts:305-309
  Both spellings of the write behave the same now that a Student reads…
  rewrite  hard to follow on first reading (87%)
  shorten  62 words

web/tests/probes/auth.probe.ts:328-330
  Directus spares only the session in the access token's `session` claim,…
  rewrite  hard to follow on first reading (80%)

web/tests/probes/author-preview.probe.ts:14-23
  Draft preview (spec, user stories 19, 20, 30): the shop pages read Directus…
  rewrite  hard to follow on first reading (80%)
  shorten  92 words

web/tests/probes/author-preview.probe.ts:29-30
  The three reads the Sales Page needs for a draft: the Course by slug and…
  remove   restates the code (90%); a reader would not have wondered about the code (70%)

web/tests/probes/author-preview.probe.ts:52
  The shape the Sales Page route actually asks for.
  remove   restates the code (92%); a reader would not have wondered about the code (60%)

web/tests/probes/author-preview.probe.ts:59-62
  Directus filters drafts out rather than refusing the request: the observed…
  shorten  51 words

web/tests/probes/author-preview.probe.ts:80-82
  The Public policy does not apply to a session, so Student and Autor each…
  rewrite  hard to follow on first reading (76%)

web/tests/probes/author.probe.ts:19-27
  Author-role permission matrix: full content CRUD (course/section/lesson,…
  shorten  50 words

web/tests/probes/author.probe.ts:202-205
  The create permission's preset fills `folder`, so an author who never…
  shorten  41 words

web/tests/probes/author.probe.ts:269-272
  Explicitly picking a foreign folder fails the create permission's…
  rewrite  hard to follow on first reading (77%)
  shorten  43 words

web/tests/probes/billing-details.probe.ts:15-23
  Billing Details on the Account and their snapshot on the Order: what a…
  shorten  56 words

web/tests/probes/checkout-flow.probe.ts:8-17
  The payment flow end to end: a real Nuxt server against the real Directus…
  shorten  77 words

web/tests/probes/checkout-flow.probe.ts:44
  Everything the run creates, so it can be taken off the instance again.
  remove   answers a question the reader would not ask (67%); it is a reason, not a description (63%)

web/tests/probes/checkout-flow.probe.ts:72-73
  „Objednávka zavazující k platbě": the gateway URL, and the mock Payment…
  remove   restates the code (76%); a reader would not have wondered about the code (52%)

web/tests/probes/checkout-flow.probe.ts:126
  A cold `nuxi dev` plus the first SSR compile.
  remove   restates the code (71%); a reader would not have wondered about the code (41%)

web/tests/probes/public-cover.probe.ts:13-17
  Anonymous (public role) access to course covers and the enriched sales…
  shorten  56 words

web/tests/probes/shop-service.probe.ts:19-27
  The Shop Service Account's permission matrix (ADR 0006): the three writes…
  shorten  63 words

web/tests/probes/shop-service.probe.ts:43-44
  Which Student an Order in a read belongs to, or undefined if the read did…
  remove   restates the code (100%); a reader would not have wondered about the code (72%)

web/tests/probes/shop-service.probe.ts:54
  A throwaway Student and an Order of theirs, created with the admin token.
  remove   restates the code (96%); a reader would not have wondered about the code (76%)

web/tests/probes/student-scoping.probe.ts:19-28
  Student-role permission matrix for the transactional collections and the…
  shorten  64 words

web/tests/probes/student-scoping.probe.ts:283-285
  Directus 11 case/when permissions: the field is in the granted union…
  rewrite  hard to follow on first reading (78%)

web/tests/probes/support.ts:1-5
  Shared plumbing for the on-demand Directus permission probes. The probes…
  shorten  49 words

web/tests/probes/support.ts:33
  The published [TEST] course's cover (a placeholder PNG in Public/kurzy).
  remove   restates the code (78%); a reader would not have wondered about the code (72%)

web/tests/probes/support.ts:44
  GET an API path; without a token the request is anonymous (public role).
  remove   restates the code (87%); a reader would not have wondered about the code (75%)

web/tests/probes/support.ts:52
  Mutating request (POST/PATCH/DELETE) with a JSON payload.
  remove   restates the code (96%); a reader would not have wondered about the code (80%)

web/tests/probes/support.ts:100
  Raw GET (e.g. /assets file downloads) where only the status matters.
  remove   restates the code (95%); a reader would not have wondered about the code (67%)

web/tests/probes/support.ts:120
  Assert a list response and return its rows.
  remove   restates the code (100%); a reader would not have wondered about the code (85%)

web/tests/probes/support.ts:126
  Assert 200 with at least one row — the shape of every positive read probe.
  remove   restates the code (86%); a reader would not have wondered about the code (76%)

web/tests/probes/support.ts:163
  Never a literal in a committed file, even for a throwaway user.
  remove   answers a question the reader would not ask (62%); it is a reason, not a description (100%)

web/tests/probes/support.ts:174-177
  Delete the rows a probe created, by id, with a token that may. `path` is the…
  shorten  49 words

web/tests/unit/auth-errors.test.ts:6
  The shape Nitro gives a rejected `$fetch`.
  remove   restates the code (88%); a reader would not have wondered about the code (31%)

web/tests/unit/catalog.test.ts:5-8
  A course row as Directus returns it for the Catalog query: the public…
  shorten  46 words

web/tests/unit/gopay-api-client.test.ts:5-7
  The client calls `$fetch`, a Nuxt auto-import — a free identifier that…
  rewrite  hard to follow on first reading (82%)

web/tests/unit/owned-courses.test.ts:5-8
  An entitlement row as Directus returns it for „Moje kurzy": the…
  shorten  42 words

web/tests/unit/password.test.ts:25
  The message quotes the number; it must not drift from the constant.
  remove   answers a question the reader would not ask (68%); it is a reason, not a description (96%)

web/tests/unit/sales.test.ts:5-9
  A course row as Directus returns it for the Sales Page query: the public…
  rewrite  hard to follow on first reading (82%)
  shorten  54 words
```

## root + web configs

```
vite.config.ts:20-23
  Generated artifacts excluded from cache-input tracking. The bare `.nuxt` /…
  rewrite           hard to follow on first reading (81%)
  shorten           46 words

vite.config.ts:43-47
  `vp check` is the one task that reads markdown — it formats it — so unlike…
  rewrite           hard to follow on first reading (82%)
  shorten           66 words

vite.config.ts:91-95
  Network-facing Directus config-as-code commands — never cache, a…
  rewrite           hard to follow on first reading (78%)
  shorten           44 words

vite.config.ts:245-249
  Directus API probes read role tokens from the environment at…
  rewrite           hard to follow on first reading (79%)
  shorten           43 words

web/app/assets/css/main.css:79
  TODO general border, needs for more elements probably
  todo-without-ref  no issue reference

web/app/assets/css/main.css:98-100
  A refusal that is neither a failure nor good news — „this Course is not on…
  shorten           43 words

web/eslint.config.js:60
  Extract <style> blocks from Vue SFCs for CSS linting
  remove            restates the code (85%); a reader would not have wondered about the code (48%)

web/nuxt.config.ts:14-21
  No `trigger` on purpose: without one, Nuxt Scripts only carries the id into…
  shorten           83 words

web/nuxt.config.ts:98-99
  Already the defaults; spelled out because it is the ADR 0002…
  remove            answers a question the reader would not ask (70%); it is a reason, not a description (99%)

web/nuxt.config.ts:112
  Shop launch switch, off unless NUXT_PUBLIC_COURSES_PUBLIC is set.
  remove            restates the code (77%); a reader would not have wondered about the code (58%)

web/nuxt.config.ts:118-121
  The Live Course thank-you page is reached only through SimpleShop's…
  shorten           43 words

web/sentry.client.config.ts:14-15
  We recommend adjusting this value in production, or using tracesSampler…
  duplicate         also at web/sentry.server.config.ts:6

web/sentry.client.config.ts:18
  Enable logs to be sent to Sentry
  remove            restates the code (98%); a reader would not have wondered about the code (64%)
  duplicate         also at web/sentry.server.config.ts:10

web/sentry.client.config.ts:21-24
  Enable sending of user PII (Personally Identifiable Information).…
  duplicate         also at web/sentry.server.config.ts:13

web/sentry.client.config.ts:38
  Setting this option to true will print useful information to the console while y…
  remove            restates the code (77%); a reader would not have wondered about the code (82%)
  duplicate         also at web/sentry.server.config.ts:30

web/sentry.server.config.ts:6-7
  We recommend adjusting this value in production, or using tracesSampler…
  duplicate         also at web/sentry.client.config.ts:14

web/sentry.server.config.ts:10
  Enable logs to be sent to Sentry
  remove            restates the code (99%); a reader would not have wondered about the code (75%)
  duplicate         also at web/sentry.client.config.ts:18

web/sentry.server.config.ts:13-16
  Enable sending of user PII (Personally Identifiable Information).…
  duplicate         also at web/sentry.client.config.ts:21

web/sentry.server.config.ts:30
  Setting this option to true will print useful information to the console while y…
  remove            restates the code (91%); a reader would not have wondered about the code (87%)
  duplicate         also at web/sentry.client.config.ts:38
```

## `certificate`, `directus`, repo tooling, `web` root, `web/archive`

```
.claude/skills/dependency-update/scripts/dep-scan.mjs:1-12
  /usr/bin/env node…
  rewrite           hard to follow on first reading (78%)
  shorten           76 words

.claude/skills/dependency-update/scripts/dep-scan.mjs:43
  Package names under `overrides:` in pnpm-workspace.yaml.
  remove            restates the code (84%); a reader would not have wondered about the code (61%)

.claude/skills/dependency-update/scripts/dep-scan.mjs:50
  Why a row is report-only, or null when it may be bumped.
  remove            restates the code (79%); a reader would not have wondered about the code (67%)

.claude/skills/dependency-update/scripts/dep-scan.mjs:70
  Semver bump kind, treating a 0.x minor as the breaking digit.
  remove            restates the code (75%); a reader would not have wondered about the code (37%)

.claude/skills/dependency-update/scripts/dep-scan.mjs:92
  npm shorthands: "owner/repo" and "github:owner/repo".
  remove            restates the code (91%); a reader would not have wondered about the code (54%)

.claude/skills/dependency-update/scripts/dep-scan.mjs:128-137
  Packages installed at more than one major, that Nuxt also maps in its…
  rewrite           hard to follow on first reading (89%)
  shorten           131 words

.claude/skills/dependency-update/scripts/dep-scan.mjs:179
  One row per dependent workspace; `location` is absolute.
  remove            restates the code (96%); a reader would not have wondered about the code (67%)

certificate/app.js:1-2
  TODO: standalone static page (HTML + plain JS, no TS/Vue). Migrate into the…
  todo-without-ref  no issue reference

certificate/app.js:157
  mm -> px @ 96dpi
  remove            restates the code (79%); a reader would not have wondered about the code (64%)

certificate/app.js:315
  Default issue date = today
  remove            restates the code (83%); a reader would not have wondered about the code (79%)

certificate/assets/jn-tokens.css:13
  Primary brand color, headings, body text
  remove            restates the code (73%); a reader would not have wondered about the code (93%)

certificate/assets/jn-tokens.css:14
  Header/nav background, soft surface
  remove            restates the code (88%); a reader would not have wondered about the code (93%)

certificate/assets/jn-tokens.css:15
  Accent text on lime sections
  remove            restates the code (75%); a reader would not have wondered about the code (94%)

certificate/assets/jn-tokens.css:18
  Section backgrounds (about, highlights)
  remove            restates the code (78%); a reader would not have wondered about the code (95%)

certificate/assets/jn-tokens.css:20
  Footer + dark surface
  remove            restates the code (77%); a reader would not have wondered about the code (96%)

certificate/assets/jn-tokens.css:61
  Modular scale, ~1.25 ratio (matches Puleo Open-Props derivation)
  remove            answers a question the reader would not ask (72%); it is a reason, not a description (98%)

certificate/assets/jn-tokens.css:62
  12px — micro / labels
  remove            restates the code (72%); a reader would not have wondered about the code (83%)

certificate/assets/jn-tokens.css:63
  14px — secondary text, nav links
  remove            restates the code (88%); a reader would not have wondered about the code (91%)

certificate/assets/jn-tokens.css:64
  16px — body
  remove            restates the code (70%); a reader would not have wondered about the code (91%)

certificate/assets/jn-tokens.css:65
  18px — body large
  remove            restates the code (72%); a reader would not have wondered about the code (91%)

certificate/assets/jn-tokens.css:67
  28px — h3
  remove            restates the code (70%); a reader would not have wondered about the code (91%)

certificate/assets/jn-tokens.css:82-87
  ============ SPACING (Puleo fluid scale) ============…
  rewrite           hard to follow on first reading (78%)
  shorten           53 words

certificate/assets/jn-tokens.css:88
  4.5  → 5px
  remove            restates the code (87%); a reader would not have wondered about the code (48%)

certificate/assets/jn-tokens.css:89
  9    → 10px
  remove            restates the code (80%); a reader would not have wondered about the code (61%)

certificate/assets/jn-tokens.css:90
  13.5 → 15px
  remove            restates the code (85%); a reader would not have wondered about the code (63%)

certificate/assets/jn-tokens.css:91
  18   → 20px
  remove            restates the code (75%); a reader would not have wondered about the code (72%)

certificate/assets/jn-tokens.css:92
  27   → 30px
  remove            restates the code (88%); a reader would not have wondered about the code (77%)

certificate/assets/jn-tokens.css:93
  36   → 40px
  remove            restates the code (91%); a reader would not have wondered about the code (69%)

certificate/assets/jn-tokens.css:94
  54   → 60px
  remove            restates the code (90%); a reader would not have wondered about the code (69%)

certificate/assets/jn-tokens.css:95
  72   → 80px
  remove            restates the code (91%); a reader would not have wondered about the code (71%)

certificate/assets/jn-tokens.css:96
  108  → 120px
  remove            restates the code (91%); a reader would not have wondered about the code (65%)

certificate/assets/jn-tokens.css:98
  4.5  → 10px
  remove            restates the code (91%); a reader would not have wondered about the code (52%)

certificate/assets/jn-tokens.css:99
  9    → 15px
  remove            restates the code (92%); a reader would not have wondered about the code (65%)

certificate/assets/jn-tokens.css:100
  13.5 → 20px
  remove            restates the code (92%); a reader would not have wondered about the code (66%)

certificate/assets/jn-tokens.css:101
  18   → 30px
  remove            restates the code (89%); a reader would not have wondered about the code (68%)

certificate/assets/jn-tokens.css:102
  27   → 40px
  remove            restates the code (93%); a reader would not have wondered about the code (68%)

certificate/assets/jn-tokens.css:103
  36   → 60px
  remove            restates the code (92%); a reader would not have wondered about the code (64%)

certificate/assets/jn-tokens.css:104
  54   → 80px
  remove            restates the code (92%); a reader would not have wondered about the code (67%)

certificate/assets/jn-tokens.css:105
  72   → 120px
  remove            restates the code (90%); a reader would not have wondered about the code (61%)

certificate/assets/jn-tokens.css:106
  13.5 → 30px
  remove            restates the code (92%); a reader would not have wondered about the code (62%)

certificate/assets/jn-tokens.css:107
  18   → 40px
  remove            restates the code (95%); a reader would not have wondered about the code (70%)

certificate/assets/jn-tokens.css:127
  ============ SHADOWS (soft, low-contrast — matches site usage) ============
  remove            answers a question the reader would not ask (72%); it is a reason, not a description (52%)

directus/extensions/email-subjects/index.js:1-22
  Czech subject lines for the transactional e-mails Directus sends.…
  todo-without-ref  no issue reference

directus/extensions/email-subjects/index.js:24
  @type {Record<string, string | undefined>}
  dead-code         commented-out code (32%)

directus/extensions/email-subjects/index.js:31
  @param {{ filter: RegisterFilter }} hooks
  dead-code         commented-out code (36%)

directus/sync.config.cjs:1-11
  directus-sync (https://github.com/tractr/directus-sync) — PULL-ONLY.…
  shorten           72 words

directus/sync.config.cjs:17
  Stable key order → reviewable git diffs.
  remove            answers a question the reader would not ask (63%); it is a reason, not a description (97%)

directus/sync.config.cjs:21-25
  Flow operations embed live third-party API keys in request headers…
  shorten           48 words

web/archive/tabor/TaborStobik2024.server.vue:308
  force all images to fill their containers
  remove            restates the code (75%); a reader would not have wondered about the code (76%)

web/env.d.ts:1-4
  TypeScript shim for `.vue` SFC imports. Added by `vp migrate` so non-Volar…
  shorten           41 words

web/vitest.unit.config.ts:3-5
  Unit tests, part of `vp run check:all` via the `check:test` task.…
  remove            answers a question the reader would not ask (77%); it is a reason, not a description (65%)
```
