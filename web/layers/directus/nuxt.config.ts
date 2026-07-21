// Marker so Nuxt registers this directory as a layer. The layer owns all
// Directus access code: client factory + schema types in shared/, app-side
// singleton wrapper in app/utils/. No domain logic lives here.
export default defineNuxtConfig({})
