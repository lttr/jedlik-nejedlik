import { IGNORED_HOSTNAMES } from "./shared/utils/ignored-hostnames"

// @nuxt/image provider config is build-time. Runtime URL flows separately into
// runtimeConfig.public.directusUrl via NUXT_PUBLIC_DIRECTUS_URL env override.
const DIRECTUS_URL = process.env.NUXT_PUBLIC_DIRECTUS_URL ?? ""

const isProduction = process.env.NODE_ENV === "production"

// Public in every page's source by design and identical across environments,
// so it is hardcoded rather than read from the environment.
const META_PIXEL_ID = "3144448269086284"

// No `trigger` here on purpose: without one, Nuxt Scripts only carries the id
// into the runtime config instead of loading the pixel on app start. The load
// gate is the consent trigger in `plugins/meta-pixel.client.ts`.
//
// `bundle` and `proxy` are off: their defaults would self-host `fbevents.js`
// and relay Meta's endpoints through our own server, so every visitor would
// reach Meta from the server's address instead of their own. The pixel is meant
// to talk to Meta directly, and only that keeps "no request reaches Meta before
// consent" a claim about the browser rather than about our proxy.
const metaPixelConfig = isProduction
  ? {
      scripts: {
        registry: {
          metaPixel: { id: META_PIXEL_ID, scriptOptions: { bundle: false, proxy: false } },
        },
      },
    }
  : {}

const plausibleModules = isProduction ? ["@nuxtjs/plausible"] : []
const plausibleConfig = isProduction
  ? {
      plausible: {
        ignoredHostnames: IGNORED_HOSTNAMES,
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
    "@nuxt/scripts",
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
      // All session config lives here: nuxt-auth-utils' `SessionConfig`
      // requires `password`, so a layer cannot contribute a partial one.
      password: "",
      // 30 sliding days (spec); the window slides because every token refresh
      // replaces the session (auth layer, session-store.ts).
      maxAge: 30 * 24 * 60 * 60,
      cookie: {
        // Already the defaults; spelled out because it is the ADR 0002
        // guarantee, not a happy accident.
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      },
    },
    public: {
      directusUrl: "",
    },
  },

  // The Live Course thank-you page is reached only through SimpleShop's
  // post-payment redirect. `robots: false` is the one switch that both renders
  // the `noindex` meta tag and keeps the URL out of `sitemap.xml` and
  // `robots.txt`'s allow list; the page's own `useRobotsRule` would do neither.
  routeRules: {
    "/dekujeme-za-objednavku-kurzu": { robots: false },
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
    // Nothing calls `defineOgImage`; the og:image tag comes from the static
    // `public/og-image.png` via nuxt-seo-utils (absolutised in app.vue).
    enabled: false,
  },

  ...plausibleConfig,

  ...metaPixelConfig,

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
