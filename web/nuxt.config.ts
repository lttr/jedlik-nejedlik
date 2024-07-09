export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@lttr/puleo", "~/assets/css/main.css"],
  modules: [
    "@lttr/nuxt-config-postcss",
    "@nuxtjs/sanity",
    "@nuxt/eslint",
    "@nuxt/fonts",
  ],

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
      link: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "48x48",
          href: "/favicon.png",
        },
      ],
    },
  },

  compatibilityDate: "2024-07-08",
})
