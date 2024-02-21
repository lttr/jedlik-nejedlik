export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["@lttr/puleo"],
  modules: ["@nuxtjs/sanity"],
  nitro: {
    preset: "netlify-edge",
  },
  sanity: {
    projectId: "oppngufr",
    apiVersion: "2023-10-23",
    dataset: "production",
    useCdn: false,
  },
})
