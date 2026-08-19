// nuxt-robots 6.0.8 augments NitroRouteConfig with `robots` only for the app
// context (.nuxt/nuxt.d.ts), not the node context that typechecks
// nuxt.config files — reference the generated augmentation directly.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

// Marker so Nuxt registers this directory as a layer. Owns identity flows:
// register, login, logout, reset (area 02).
export default defineNuxtConfig({
  runtimeConfig: {
    // Static token of the Directus service user whose policy allows creating
    // Student-role users and nothing else. Env: NUXT_DIRECTUS_SERVICE_TOKEN.
    // Private — it must never reach the browser.
    directusServiceToken: "",
  },

  routeRules: {
    // Identity pages are for one Student at a time, never for search
    // results. `robots: false` sets X-Robots-Tag + meta noindex and drops
    // the route from the sitemap.
    "/muj-ucet": { robots: false },
    "/prihlaseni": { robots: false },
    "/registrace": { robots: false },
  },
})
