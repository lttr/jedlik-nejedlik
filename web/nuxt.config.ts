const DIRECTUS_URL = "https://obsah-jedlika.lttr.cz"

export default defineNuxtConfig({
  modules: [
    "@lttr/nuxt-config-postcss",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@nuxt/icon",
    "nuxt-svgo",
    "@nuxtjs/plausible",
    "@nuxt/image",
  ],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  devtools: {
    enabled: true,
  },

  css: ["@lttr/puleo", "~/assets/css/main.css"],

  site: {
    url: "https://example.com",
    name: "Jedlík-nejedlík",
    description: "Aby každé jídlo bylo radost",
    defaultLocale: "cs",
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    componentIslands: true,
    typedPages: true,
  },

  compatibilityDate: "2024-10-18",

  eslint: {
    config: {
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  image: {
    domains: [DIRECTUS_URL],
    provider: "directus",
    directus: {
      baseURL: `${DIRECTUS_URL}/assets`,
    },
  },

  lttrConfigPostcss: {
    filesWithGlobals: ["./node_modules/@lttr/puleo/output/media.css"],
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
})
