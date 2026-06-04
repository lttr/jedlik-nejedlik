// @nuxt/image provider config is build-time. Runtime URL flows separately into
// runtimeConfig.public.directusUrl via NUXT_PUBLIC_DIRECTUS_URL env override.
const DIRECTUS_URL = process.env.NUXT_PUBLIC_DIRECTUS_URL ?? ""

export default defineNuxtConfig({
  modules: [
    "@lttr/nuxt-config-postcss",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/plausible",
    "@nuxtjs/seo",
    "nuxt-svgo",
    "@vueuse/nuxt",
    "@dxup/nuxt",
    "@sentry/nuxt/module",
  ],

  // nuxt-og-image 6.4.9 (via @nuxtjs/seo) prompts to pick a renderer on dev
  // startup when no renderer dep is installed, and that consola prompt crashes
  // (`uv_tty_init EINVAL`), killing `nuxi dev`. Build is unaffected (falls back
  // to takumi + zeroRuntime). Disable the module in dev only — OG images are
  // generated at build, so we lose nothing locally.
  $development: {
    ogImage: { enabled: false },
  },

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
    url: "https://www.jedlik-nejedlik.cz",
    name: "Jedlík-nejedlík",
    description: "Výživa a výchova v propojení",
    defaultLocale: "cs",
  },

  runtimeConfig: {
    public: {
      directusUrl: "",
    },
  },

  sourcemap: {
    client: "hidden",
  },

  experimental: {
    componentIslands: true,
    typedPages: true,
    typescriptPlugin: true,
    viewTransition: true,
  },

  compatibilityDate: "2025-12-01",

  vite: {
    optimizeDeps: {
      include: ["@plausible-analytics/tracker", "@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  eslint: {
    config: {
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  fonts: {
    families: [
      {
        name: "Poppins",
        weights: ["400", "600", "700"],
      },
    ],
    // Extend @nuxt/fonts metric fallbacks to `font-family: var(...)` (Puleo uses them) to cut font-swap CLS.
    processCSSVariables: true,
  },

  image: {
    domains: [DIRECTUS_URL],
    provider: "directus",
    directus: {
      baseURL: `${DIRECTUS_URL}/assets`,
    },
  },

  lttrConfigPostcss: {
    // Since we're in a monorepo, we need to use the relative path
    filesWithGlobals: ["../node_modules/@lttr/puleo/output/media.css"],
  },

  ogImage: {
    zeroRuntime: true,
  },

  plausible: {
    ignoredHostnames: ["localhost", "jedlik-nejedlik-test.lttr.cz"],
    apiHost: "https://plausible.lttr.cz",
  },

  sentry: {
    org: "lukas-trumm",
    project: "jedlik-nejedlik",
  },

  svgo: {
    autoImportPath: "./assets/svgs/",
    // Don't wrap svg files inside module provided icon component
    defaultImport: "component",
  },
})
