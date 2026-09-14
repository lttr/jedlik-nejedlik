// Marker so Nuxt registers this directory as a layer. Owns catalog,
// checkout, payments, invoicing (areas 03–05).
export default defineNuxtConfig({
  // The layer contributes its own sitemap source: Nuxt merges layer config
  // with defu, so this array joins the root's rather than replacing it, and
  // the shop's URLs stay declared next to the route that serves them.
  sitemap: {
    sources: ["/api/__sitemap__/courses"],
  },
})
