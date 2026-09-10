# Implementation notes

## 01 — Consent banner and pixel

- Nuxt Scripts' Meta Pixel registry entry defaults to `bundle` + `proxy` on, which
  self-hosts `fbevents.js` and routes Meta's endpoints through our Nitro server, so
  every visitor would reach Meta from the server's address. The spec is silent on
  this; both were turned off, so "no request reaches Meta" is a claim about the
  browser rather than about our proxy. Revisit if the ad-blocker-resistant
  first-party variant is ever wanted.
- The privacy policy's separate "Předávání dat mimo Evropskou unii" section said
  flatly that no data leaves the EU, which the pixel contradicts; one qualifying
  sentence pointing at the Cookies chapter was added, slightly beyond the ticket's
  "targeted edit to the cookies section". The cookies paragraph's claim about
  Plausible (cookieless, no IP storage, country-level) was also reworded. The site
  owner's sign-off on the policy edit covers both.
- The production gate keys on `import.meta.dev` plus the ignored-hostname list, not
  on the configured pixel id: oxlint's `no-unnecessary-condition` rejects reading
  `runtimeConfig.public.scripts?.metaPixel?.id` because typecheck runs in production
  mode where the types always show the id. `nuxi build` forces
  `NODE_ENV=production`, so the two gates coincide.
- Left unverified: that events actually arrive at Meta. Only the script and config
  requests are observable from `127.0.0.1`; no `www.facebook.com/tr` PageView beacon
  fires for an unregistered domain. Closed by the marketer confirming events in
  Events Manager on the production domain, as the spec assigns.

## 02 — Buy links fire InitiateCheckout

- Deliberate partial revert of `5af4992`: the Google Form link is undone, but its
  "Objednávka probíhá v rezervačním systému STOB." note is not restored (the button
  now goes to SimpleShop, not STOB) and its 6.–9. capacity fix to 10 children stands.
  Reading the ticket's acceptance box as a full revert would be wrong.
- `useScriptMetaPixel()` must stay a single call site. unhead re-runs the trigger
  handler for an already-registered script, so a second call without the consent
  trigger would load the pixel immediately and silently break the gate. Events go
  through the plugin's `$trackMetaPixelEvent` instead.
- `name` and `startDate` in `LIVE_COURSES` now restate dates that are also hardcoded
  as copy (`ObesityCoursePromo` prints "11. ledna 2027") and as `term` /
  `lessons-part1` props, with nothing tying them together. Driving the visible copy
  from the table would change the rendered date format, so it was left alone —
  decide in ticket 03.
- Left unverified, same limit as ticket 01: Meta suppresses the `www.facebook.com/tr`
  beacon for the unregistered `127.0.0.1` domain, so the event was proven by stubbing
  `fbevents.js` and recording the SDK calls the app makes. That proves what the site
  sends, not what Meta receives; closed by the marketer in Events Manager.
