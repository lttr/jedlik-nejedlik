/** Standard Meta events this site sends. Not a `value` or a price among them. */
type MetaPixelEvent = "InitiateCheckout" | "Purchase"

interface TrackOptions {
  /**
   * Send at most one such event per browser session. `Purchase` needs it: the
   * thank-you page it fires from is a plain URL a buyer can reload.
   */
  once?: boolean
}

/**
 * `contentName` is the Live Course id. It is optional because a `Purchase` from
 * a thank-you page with an unknown or missing `kurz` still counts as a sale,
 * just without saying which course it was.
 */
type TrackMetaPixelEvent = (
  event: MetaPixelEvent,
  contentName?: string,
  options?: TrackOptions,
) => void

/** Stands in wherever the pixel is not loaded at all, so callers need no gate. */
const ignoreEvent: TrackMetaPixelEvent = () => {}

/**
 * Claims the one slot this event has in the current session, returning whether
 * it was still free. Kept next to the sending code so no caller has to invent a
 * key format of its own.
 */
function claimOncePerSession(event: MetaPixelEvent, contentName: string | undefined): boolean {
  const key = `meta-pixel:${event}:${contentName ?? ""}`
  if (sessionStorage.getItem(key) !== null) {
    return false
  }
  sessionStorage.setItem(key, "1")
  return true
}

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
  // visitor who has not accepted would reach Meta the moment they do. The
  // consent check comes before the once-per-session claim, so a refusing
  // visitor who later accepts has not silently spent their one slot.
  const track: TrackMetaPixelEvent = (event, contentName, options) => {
    if (!isGranted.value) {
      return
    }
    if (options?.once === true && !claimOncePerSession(event, contentName)) {
      return
    }
    proxy.fbq("track", event, contentName === undefined ? {} : { content_name: contentName })
  }
  return { provide: { trackMetaPixelEvent: track } }
})
