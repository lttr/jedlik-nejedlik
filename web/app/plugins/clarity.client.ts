/**
 * Loads Microsoft Clarity, gated on the same cookie consent as the Meta Pixel.
 *
 * `useScriptTriggerConsent` is a load gate: until it resolves not even the tag
 * request is made, so Clarity's own `defaultConsent` is not used. The project
 * id is set only in production (nuxt.config), and masking is configured in the
 * Clarity project itself.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || IGNORED_HOSTNAMES.includes(window.location.hostname)) {
    return
  }

  const { isGranted } = useCookieConsent()
  const { proxy } = useScriptClarity({
    scriptOptions: { trigger: useScriptTriggerConsent({ consent: isGranted }) },
  })

  // A script cannot be unloaded, so a mid-visit withdrawal has to reach the tag
  // through Clarity's own consent call. `hasRevoked` keeps the first acceptance
  // clean: a `true` is sent only to undo a revoke.
  let hasRevoked = false
  watch(isGranted, (granted) => {
    if (!granted) {
      proxy.clarity("consent", false)
      hasRevoked = true
    } else if (hasRevoked) {
      proxy.clarity("consent", true)
    }
  })
})
