import { useCookieConsent } from "../composables/cookie-consent"
import { IGNORED_HOSTNAMES } from "#shared/utils/ignored-hostnames"

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
 * Claims this event's one slot for the session. Where the browser refuses
 * `sessionStorage` the catch lets the event through: a possible double count
 * costs less than a lost sale.
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
 * Loads the Meta Pixel once the visitor accepted cookies, and is the only place
 * that may call `useScriptMetaPixel()`. See docs/analytics.md, „Meta Pixel".
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || IGNORED_HOSTNAMES.includes(window.location.hostname)) {
    return { provide: { trackMetaPixelEvent: ignoreEvent } }
  }

  const { isGranted } = useCookieConsent()
  const { proxy } = useScriptMetaPixel({
    scriptOptions: { trigger: useScriptTriggerConsent({ consent: isGranted }) },
  })

  // A loaded script cannot be unloaded, so a mid-visit withdrawal has to reach
  // the pixel through Meta's own consent call. `hasRevoked` keeps `grant` from
  // ever preceding Meta's `init`.
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
