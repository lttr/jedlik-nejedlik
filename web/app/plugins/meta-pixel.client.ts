type MetaPixelEvent = "PageView" | "InitiateCheckout" | "Purchase"

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
 * it was still free. Kept beside the sending code so no caller invents a key
 * format of its own.
 *
 * `sessionStorage` throws outright where the browser refuses storage, and an
 * unguarded throw would take the whole event down. Such a visitor gets no slot
 * bookkeeping: the sale is still measured, and a reload may double-count it.
 */
function claimOncePerSession(event: MetaPixelEvent, contentName: string | undefined): boolean {
  const key = `meta-pixel:${event}:${contentName ?? ""}`
  try {
    if (sessionStorage.getItem(key) !== null) {
      return false
    }
    sessionStorage.setItem(key, "1")
  } catch {
    return true
  }
  return true
}

/**
 * Loads the Meta Pixel only once the visitor accepted cookies, and provides the
 * one way to send an event.
 *
 * `useScriptTriggerConsent` is a load gate: until it resolves, `fbevents.js` is
 * not even requested. Meta's own `defaultConsent: 'denied'` would fetch the SDK
 * anyway, so it is not used.
 *
 * The pixel id (`scripts.registry.metaPixel` in nuxt.config) is set only in
 * production, so outside a production build there is nothing to load. A second
 * `useScriptMetaPixel()` call would load the script without the consent trigger,
 * so it is called here and nowhere else and everything else sends through
 * `$trackMetaPixelEvent`.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || IGNORED_HOSTNAMES.includes(window.location.hostname)) {
    return { provide: { trackMetaPixelEvent: ignoreEvent } }
  }

  const { isGranted } = useCookieConsent()
  const { proxy } = useScriptMetaPixel({
    scriptOptions: { trigger: useScriptTriggerConsent({ consent: isGranted }) },
  })

  // A visitor who withdraws mid-visit has to reach the pixel that is already
  // loaded. `@nuxt/scripts` cannot unload a script, and silencing `track` below
  // would stop only our own events while the pixel kept sending for the rest of
  // the SPA session, so Meta's own consent call is what has to stop it.
  // `hasRevoked` keeps the first acceptance clean: a `grant` undoes a revoke and
  // is never sent before Meta's `init`.
  let hasRevoked = false
  watch(isGranted, (granted) => {
    if (!granted) {
      proxy.fbq("consent", "revoke")
      hasRevoked = true
    } else if (hasRevoked) {
      proxy.fbq("consent", "grant")
    }
  })

  const track: TrackMetaPixelEvent = (event, contentName, options) => {
    if (!isGranted.value) {
      return
    }
    // After the consent check, so a visitor who refuses and later accepts has
    // not silently spent their one slot.
    if (options?.once === true && !claimOncePerSession(event, contentName)) {
      return
    }
    proxy.fbq("track", event, contentName === undefined ? {} : { content_name: contentName })
  }

  // A SPA route change makes no new document, so the registry's one `PageView`
  // at load is all Meta would see. `from.matched` is empty only on that initial
  // navigation, so this never double-counts it.
  useRouter().afterEach((to, from) => {
    if (from.matched.length === 0 || to.fullPath === from.fullPath) {
      return
    }
    track("PageView")
  })

  return { provide: { trackMetaPixelEvent: track } }
})
