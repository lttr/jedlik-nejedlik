# Analytics and consent

How the optional scripts (Meta Pixel, Microsoft Clarity) are gated on the
visitor's cookie decision, and where the Live Course tracking facts live. The
consent guarantee itself is in `web/nuxt.config.ts` next to the script
registry.

## Cookie consent

The visitor's cookie decision is the single gate in front of every optional
script. `useCookieConsent()` (`web/app/composables/cookie-consent.ts`) owns it
and is the only source of truth: no copy of the decision is kept anywhere else.

The decision lives in `localStorage` and never reaches the server, so it is
per browser, not per Account. It is stored together with a consent version;
the consent bar is open exactly while no decision for the _current_ version is
stored, which is how a change to the wording or the scope asks everyone again.
Reopening the bar from the footer control clears the stored decision, so the
bar and the store cannot disagree. VueUse's storage event keeps every instance
of the composable in sync within the tab.

In development the bar stays hidden until the settings button asks for it, so
it does not sit over every page while working on the site.

The bar itself (`web/app/components/CookieConsentBar.vue`) is fixed over the
bottom of the viewport, which would otherwise cover the footer's last links,
the consent control among them, with no amount of scrolling able to reach
them. Its height is measured rather than assumed, because the bar wraps to
several lines at 375px.

## Meta Pixel

`web/app/plugins/meta-pixel.client.ts` loads the Meta Pixel and is the one
place allowed to call `useScriptMetaPixel()`. Everything else sends events
through the injected `$trackMetaPixelEvent`, because a second
`useScriptMetaPixel()` call anywhere would load the script _without_ the
consent trigger.

`useScriptTriggerConsent` is a load gate: until it resolves, `fbevents.js` is
not even requested. Meta's own `defaultConsent: 'denied'` is deliberately not
used, since it fetches the SDK anyway.

The pixel id (`scripts.registry.metaPixel` in `nuxt.config`) is set only in
production, so outside a production build there is nothing to load at all.

A visitor who withdraws consent mid-visit has to reach a pixel that is already
loaded. `@nuxt/scripts` cannot unload a script, and silencing our own `track`
call would stop only our events while the pixel kept sending for the rest of
the SPA session, so Meta's own `fbq("consent", "revoke")` is what has to stop
it. A `hasRevoked` flag keeps the first acceptance clean: `grant` only ever
undoes an earlier `revoke`, and is never sent before Meta's `init`.

Events that may fire on a reloadable URL (`Purchase` on the thank-you page)
claim a one-per-session slot in `sessionStorage`. Where the browser refuses
storage the access throws; the throw is caught and the event goes out anyway,
because a possible double count costs less than a lost sale.

## Microsoft Clarity

`web/app/plugins/clarity.client.ts` loads Microsoft Clarity behind the same
cookie consent as the Meta Pixel, through the same `useScriptTriggerConsent`
load gate: until consent resolves, not even the tag request is made, so
Clarity's own `defaultConsent` is not used.

The project id is set only in production (`nuxt.config`), and masking is
configured in the Clarity project itself rather than in this code. As with the
pixel, a script that is already loaded cannot be unloaded, so a mid-visit
withdrawal is passed on through Clarity's own consent call.

## Ignored hosts

`IGNORED_HOSTNAMES` (`web/shared/utils/ignored-hostnames.ts`) lists the hosts
whose traffic must never reach analytics or ad tools: local development and
the test site. It is shared by the Plausible config in `nuxt.config` and by the
Meta Pixel and Clarity gates in `web/app/plugins/`, so the checks cannot drift
apart.

`127.0.0.1` is on the list because a local production build (`vp run build`
plus `node .output/server/index.mjs`) is not `import.meta.dev`: served under
that hostname it would otherwise load the real pixel and send real events.

## Live Course tracking table

`LIVE_COURSES` (`web/app/utils/live-courses.ts`) holds the Live Courses that
are actively sold and measured: a handful of hardcoded facts per course, read
by the buy link and by the thank-you page. They are not in Directus because
nothing edits them, and not in the `shop` layer either: the table gets deleted,
not extended, once the checkout moves in-house.

The keys are the ids Meta sees as an event's content name and SimpleShop
passes back in the `kurz` query parameter. They are anchored on the course's
start date rather than on the sales season, so they diverge from route slugs on
purpose.
