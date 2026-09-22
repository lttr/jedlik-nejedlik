// `defineNuxtConfig` is a global in a layer config, but only for the layers
// the generated tsconfig knows about, and this one is nested on purpose (see
// the shop layer's config), so it imports what it uses.
import { defineNuxtConfig } from "nuxt/config"

// The mock payment gateway as a Nuxt layer of its own. The shop layer extends
// it only in mock mode, so outside mock mode neither its page nor its routes
// are in the build at all (spec, „Mock gateway"). It sits inside
// `layers/shop` rather than beside it, because Nuxt auto-discovers `layers/*`
// and would otherwise register it unconditionally.
export default defineNuxtConfig({})
