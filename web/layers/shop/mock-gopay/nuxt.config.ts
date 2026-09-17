// `defineNuxtConfig` is a global in a layer config, but only for the layers
// the generated tsconfig knows about, and this one is nested on purpose (see
// the shop layer's config), so it imports what it uses.
import { defineNuxtConfig } from "nuxt/config"

// The mock payment gateway, a layer of its own so that whether it exists at
// all is one line in the shop layer's config: outside mock mode it is not
// extended, and its page and routes are not in the build (spec, „Mock
// gateway"). It sits inside `layers/shop`, not next to it, precisely so that
// Nuxt's `layers/*` auto-discovery does not register it unconditionally.
export default defineNuxtConfig({})
