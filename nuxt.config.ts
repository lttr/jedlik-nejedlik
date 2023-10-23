// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/sanity"],
  nitro: {
    preset: "netlify-edge",
  },
  sanity: {
    projectId: "oppngufr",
    dataset: "production",
  },
});
