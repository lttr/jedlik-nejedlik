// `defineNuxtConfig` is a global in a layer config, but only for the layers
// the generated tsconfig knows about, and this one is nested on purpose (see
// the shop layer's config), so it imports what it uses.
import { defineNuxtConfig } from "nuxt/config"

// The mock payment gateway, extended by the shop layer only in mock mode.
// See docs/shop.md, „Mock gateway".
export default defineNuxtConfig({})
