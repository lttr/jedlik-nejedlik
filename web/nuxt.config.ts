// @nuxt/image provider config is build-time. Runtime URL flows separately into
// runtimeConfig.public.directusUrl via NUXT_PUBLIC_DIRECTUS_URL env override.
const DIRECTUS_URL = process.env.NUXT_PUBLIC_DIRECTUS_URL ?? ""

const isProduction = process.env.NODE_ENV === "production"

const plausibleModules = isProduction ? ["@nuxtjs/plausible"] : []
const plausibleConfig = isProduction
  ? {
      plausible: {
        ignoredHostnames: ["localhost", "jedlik-nejedlik-test.lttr.cz"],
        apiHost: "https://plausible.lttr.cz",
      },
    }
  : {}

export default defineNuxtConfig({
  modules: [
    "@lttr/nuxt-config-postcss",
    "@lttr/nuxt-validated-runtime-config",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    ...plausibleModules,
    "@nuxtjs/seo",
    "nuxt-svgo",
    "@vueuse/nuxt",
    "@dxup/nuxt",
    "@sentry/nuxt/module",
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
    url: "https://www.jedlik-nejedlik.cz",
    name: "Jedlík-nejedlík",
    description: "Výživa a výchova v propojení",
    defaultLocale: "cs",
  },

  runtimeConfig: {
    session: {
      // The whole session config lives here next to `password`, which the
      // runtime-config schema validates: nuxt-auth-utils' `SessionConfig`
      // type requires `password`, so a layer cannot contribute a partial one.
      password: "",
      // 30 sliding days (spec). h3 derives the sealed cookie's expiry from
      // the session's creation time, so the window slides only because every
      // Directus token refresh *replaces* the session — see the auth layer's
      // server/utils/session-store.ts.
      maxAge: 30 * 24 * 60 * 60,
      cookie: {
        // h3 and the module already default to exactly this; spelled out
        // because it is the ADR 0002 guarantee, not a happy accident.
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      },
    },
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

  ...plausibleConfig,

  sentry: {
    org: "lukas-trumm",
    project: "jedlik-nejedlik",
    // No source-map upload or telemetry: both shell out to sentry.io and add
    // ~17s to every build.
    sourcemaps: { disable: true },
    telemetry: false,
  },

  svgo: {
    autoImportPath: "./assets/svgs/",
    // Don't wrap svg files inside module provided icon component
    defaultImport: "component",
  },
})
