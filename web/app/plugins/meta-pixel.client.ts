/**
 * Loads the Meta Pixel, but only once the visitor accepted cookies.
 *
 * `useScriptTriggerConsent` is a load gate: until it resolves not even the
 * `fbevents.js` request is made. Meta's own `defaultConsent: 'denied'` would
 * queue a revoke but still fetch the SDK, so it is not used here.
 *
 * The pixel id comes from `scripts.registry.metaPixel` in nuxt.config, which is
 * only set in production — the same `NODE_ENV` gate `nuxi build` forces and the
 * Plausible block uses, so outside a production build there is nothing to load.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || IGNORED_HOSTNAMES.includes(window.location.hostname)) {
    return
  }

  const { isGranted } = useCookieConsent()
  useScriptMetaPixel({
    scriptOptions: { trigger: useScriptTriggerConsent({ consent: isGranted }) },
  })
})
