# Analytics and consent

How the optional scripts (Meta Pixel, Microsoft Clarity) are gated on the
visitor's cookie decision, and where the Live Course tracking facts live. The
script registry and the consent trigger are in `web/nuxt.config.ts`.

## Cookie consent

`useCookieConsent()` (`web/app/composables/cookie-consent.ts`) is the only
source of truth for the decision. It lives in `localStorage` next to a consent
version, so it is per browser, never per Account, and never reaches the server.
The bar is open exactly while no decision for the current version is stored,
which is how a change to the wording or scope asks everyone again. Reopening
the bar from the footer clears the stored decision, so bar and store cannot
disagree.

In development the bar stays hidden until the settings button asks for it.

The bar is fixed over the bottom of the viewport, where it would cover the
footer's last links, the consent control among them. Its height is measured
rather than assumed, because it wraps to several lines at 375px.

## Meta Pixel

`web/app/plugins/meta-pixel.client.ts` is the one place allowed to call
`useScriptMetaPixel()`. Everything else sends events through the injected
`$trackMetaPixelEvent`, because a second `useScriptMetaPixel()` call anywhere
would load the script without the consent trigger.

`useScriptTriggerConsent` is a load gate: until consent resolves, `fbevents.js`
is not requested at all. Meta's own `defaultConsent: 'denied'` is not used
because it fetches the SDK anyway. The pixel id is set only in production, so
other builds have nothing to load.

A loaded pixel cannot be unloaded, and silencing our own `track` call would
leave Meta's automatic events running, so a mid-visit withdrawal is passed on
as `fbq("consent", "revoke")`. `grant` only ever undoes an earlier `revoke`
and is never sent before Meta's `init`.

Events that may fire on a reloadable URL (`Purchase` on the thank-you page)
claim a one-per-session slot in `sessionStorage`. When storage throws, the
event goes out anyway: a possible double count costs less than a lost sale.

## Microsoft Clarity

`web/app/plugins/clarity.client.ts` loads Clarity behind the same consent gate
as the pixel. The tag is not requested before consent, so Clarity's own
`defaultConsent` is not used, and a mid-visit withdrawal goes through Clarity's
consent call. The project id is set only in production. Masking is configured
in the Clarity project, not in code.

## Ignored hosts

`IGNORED_HOSTNAMES` (`web/shared/utils/ignored-hostnames.ts`) lists the hosts
whose traffic must never reach analytics: local development and the test site.
The Plausible config and both plugin gates share the one list.

`127.0.0.1` is on the list because a local production build (`vp run build`
plus `node .output/server/index.mjs`) is not `import.meta.dev` and would
otherwise send real events.

## Live Course tracking table

`LIVE_COURSES` (`web/app/utils/live-courses.ts`) holds the hardcoded facts per
Live Course that the buy link and the thank-you page read. Nothing edits them,
so they are not in Directus, and the table is deleted rather than extended once
the checkout moves in-house, so it is not in the `shop` layer either.

The keys are the ids Meta sees as content name and SimpleShop passes back in the
`kurz` query parameter. They are anchored on the course's start date, so they
diverge from route slugs on purpose.
