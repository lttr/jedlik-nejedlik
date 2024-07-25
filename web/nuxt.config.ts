export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@lttr/puleo", "~/assets/css/main.css"],
  modules: [
    "@lttr/nuxt-config-postcss",
    "@nuxtjs/sanity",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@nuxt/icon",
    "nuxt-svgo",
    "@nuxtjs/plausible",
  ],

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

  sanity: {
    projectId: "oppngufr",
    apiVersion: "2023-10-23",
    dataset: "production",
    useCdn: false,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "cs",
      },
    },
  },

  compatibilityDate: "2024-07-08",
})
