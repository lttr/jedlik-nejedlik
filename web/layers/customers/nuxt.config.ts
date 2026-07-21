// nuxt-robots 6.0.8 augments NitroRouteConfig with `robots` only for the app
// context (.nuxt/nuxt.d.ts), not the node context that typechecks
// nuxt.config files — reference the generated augmentation directly.
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

// Marker so Nuxt registers this directory as a layer. Owns identity flows:
// register, login, logout, reset (area 02). The scaffold page proves layer
// wiring and is deleted when the layer's first real page lands.
export default defineNuxtConfig({
  routeRules: {
    // robots: false marks the route non-indexable (X-Robots-Tag + meta
    // noindex via @nuxtjs/robots); @nuxtjs/sitemap drops non-indexable
    // routes from the sitemap.
    "/_scaffold/customers": { robots: false },
  },
})
