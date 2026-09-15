// nuxt-robots augments NitroRouteConfig with `robots` only for the app
// context, not the node context that typechecks nuxt.config files.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

// Baked into the build, so the env var is read here rather than from
// `runtimeConfig.public.coursesPublic`.
const coursesPublic = process.env.NUXT_PUBLIC_COURSES_PUBLIC === "true"

// Marker so Nuxt registers this directory as a layer. Owns catalog,
// checkout, payments, invoicing (areas 03–05).
export default defineNuxtConfig({
  routeRules: coursesPublic
    ? {}
    : {
        "/kurzy": { robots: false },
        "/kurzy/**": { robots: false },
      },

  // The layer contributes its own sitemap source: Nuxt merges layer config
  // with defu, so this array joins the root's rather than replacing it, and
  // the shop's URLs stay declared next to the route that serves them.
  sitemap: {
    sources: coursesPublic ? ["/api/__sitemap__/courses"] : [],
  },
})
