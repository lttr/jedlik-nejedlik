export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@lttr/puleo", "~/assets/css/main.css"],
  modules: ["@nuxtjs/google-fonts", "@nuxtjs/sanity"],
  googleFonts: {
    families: {
      "Noto Sans": [400, 600],
    },
    preload: true,
    download: true,
  },
  postcssConfig: {
    filesWithGlobals: ["./node_modules/open-props/media.min.css"],
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
})
