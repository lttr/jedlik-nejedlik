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
