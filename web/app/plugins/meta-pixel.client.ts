/** Standard Meta events this site sends. Not a `value` or a price among them. */
type MetaPixelEvent = "InitiateCheckout"

type TrackMetaPixelEvent = (event: MetaPixelEvent, contentName: string) => void

/** Stands in wherever the pixel is not loaded at all, so callers need no gate. */
const ignoreEvent: TrackMetaPixelEvent = () => {}

/**
 * Loads the Meta Pixel, but only once the visitor accepted cookies, and hands
 * the rest of the app the one way to send an event.
 *
 * `useScriptTriggerConsent` is a load gate: until it resolves not even the
 * `fbevents.js` request is made. Meta's own `defaultConsent: 'denied'` would
 * queue a revoke but still fetch the SDK, so it is not used here.
 *
 * The pixel id comes from `scripts.registry.metaPixel` in nuxt.config, which is
 * only set in production — the same `NODE_ENV` gate `nuxi build` forces and the
 * Plausible block uses, so outside a production build there is nothing to load.
 * `useScriptMetaPixel()` is called here and nowhere else: a second call without
 * the consent trigger would load the script immediately (unhead re-runs the
 * trigger handler for an already registered script), so tracking goes through
 * `$trackMetaPixelEvent` instead.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || IGNORED_HOSTNAMES.includes(window.location.hostname)) {
    return { provide: { trackMetaPixelEvent: ignoreEvent } }
  }

  const { isGranted } = useCookieConsent()
  const { proxy } = useScriptMetaPixel({
    scriptOptions: { trigger: useScriptTriggerConsent({ consent: isGranted }) },
  })

  // The proxy queues calls made before the script loads, so a call from a
  // visitor who has not accepted would reach Meta the moment they do.
  const track: TrackMetaPixelEvent = (event, contentName) => {
    if (isGranted.value) {
      proxy.fbq("track", event, { content_name: contentName })
    }
  }
  return { provide: { trackMetaPixelEvent: track } }
})
