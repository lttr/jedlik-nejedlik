// nuxt-robots augments NitroRouteConfig with `robots` only for the app
// context, not the node context that typechecks nuxt.config files.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

export default defineNuxtConfig({
  modules: ["nuxt-auth-utils"],

  components: false,

  routeRules: {
    // Identity pages must never be indexed: `robots: false` sets noindex and
    // drops the route from the sitemap.
    "/muj-ucet": { robots: false },
    "/obnova-hesla": { robots: false },
    "/overeni-emailu": { robots: false },
    "/prihlaseni": { robots: false },
    "/registrace": { robots: false },
  },
})
