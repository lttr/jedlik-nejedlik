// nuxt-robots 6.0.8 augments NitroRouteConfig with `robots` only for the app
// context (.nuxt/nuxt.d.ts), not the node context that typechecks
// nuxt.config files — reference the generated augmentation directly
// (a .d.ts path is not importable, so `import` style can't replace this).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

// Marker so Nuxt registers this directory as a layer. Owns catalog,
// checkout, payments, invoicing (areas 03–05). The scaffold page proves
// layer wiring and is deleted when the layer's first real page lands.
export default defineNuxtConfig({
  routeRules: {
    // robots: false marks the route non-indexable (X-Robots-Tag + meta
    // noindex via @nuxtjs/robots); @nuxtjs/sitemap drops non-indexable
    // routes from the sitemap.
    "/_scaffold/shop": { robots: false },
  },
})
