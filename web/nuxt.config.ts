export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ["@lttr/puleo", "~/assets/css/main.css"],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  modules: [
    "@lttr/nuxt-config-postcss",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@nuxt/icon",
    "nuxt-svgo",
    "@nuxtjs/plausible",
    "nuxt-directus",
  ],

  site: {
    url: "https://example.com",
    name: "Jedlík-nejedlík",
    description: "Aby každé jídlo bylo radost",
    defaultLocale: "cs",
  },

  directus: {
    url: "https://obsah-jedlika.lttr.cz",
  },

  plausible: {
    ignoredHostnames: ["localhost", "jedlik-nejedlik-test.lttr.cz"],
    apiHost: "https://plausible.lttr.cz",
  },

  svgo: {
    autoImportPath: "./assets/svgs/",
    // Don't wrap svg files inside module provided icon component
    defaultImport: "component",
  },

  lttrConfigPostcss: {
    filesWithGlobals: ["./node_modules/@lttr/puleo/output/media.css"],
  },

  experimental: {
    componentIslands: true,
  },

  compatibilityDate: "2024-07-08",
})
