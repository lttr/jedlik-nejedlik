// Marker so Nuxt registers this directory as a layer. Owns identity flows:
// register, login, logout, reset (area 02).
export default defineNuxtConfig({
  // The layer that owns identity owns the session module.
  modules: ["nuxt-auth-utils"],

  runtimeConfig: {
    session: {
      // Placeholder so the NUXT_SESSION_PASSWORD override has a key to target —
      // the real value comes from the environment and is checked at boot by
      // `privateSchema` in web/server/runtime-config.schema.ts.
      password: "",
      // Matched to Directus's refresh-token TTL so a returning Student stays
      // signed in rather than being logged out mid-course.
      maxAge: 60 * 60 * 24 * 30,
    },
  },
})

// Indexing is handled per page with `useSeoMeta({ robots: ... })` rather than
// route rules: nuxt-robots augments the route-rule type in the root app, and a
// layer config is typed against the base schema without that augmentation.
