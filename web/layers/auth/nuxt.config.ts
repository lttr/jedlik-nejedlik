// nuxt-robots 6.0.8 augments NitroRouteConfig with `robots` only for the app
// context (.nuxt/nuxt.d.ts), not the node context that typechecks
// nuxt.config files — reference the generated augmentation directly.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

// Marker so Nuxt registers this directory as a layer. Owns the identity
// lifecycle: register, login, logout, reset, account shell (area 02).
export default defineNuxtConfig({
  modules: ["nuxt-auth-utils"],

  routeRules: {
    // Identity pages are for one Student at a time, never for search results.
    // `robots: false` sets X-Robots-Tag + meta noindex and drops the route
    // from the sitemap.
    "/muj-ucet": { robots: false },
    "/obnova-hesla": { robots: false },
    "/overeni-emailu": { robots: false },
    "/prihlaseni": { robots: false },
    "/registrace": { robots: false },
  },
})
