export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@lttr/puleo", "~/assets/css/main.css"],
  modules: [
    "@lttr/nuxt-config-postcss",
    "@nuxtjs/google-fonts",
    "@nuxtjs/sanity",
    "@nuxt/eslint",
  ],

  lttrConfigPostcss: {
    filesWithGlobals: ["./node_modules/@lttr/puleo/output/media.css"],
  },

  googleFonts: {
    families: {
      "Noto Sans": [400, 600],
    },
    preload: true,
    download: true,
  },

  nitro: {
    preset: "netlify-edge",
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
