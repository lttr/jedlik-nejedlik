// nuxt-robots augments NitroRouteConfig with `robots` only for the app
// context, not the node context that typechecks nuxt.config files.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../.nuxt/types/nuxt-robots-nitro.d.ts" />

import { fileURLToPath } from "node:url"

// Baked into the build, so the env var is read here rather than from
// `runtimeConfig.public.coursesPublic`.
const coursesPublic = process.env.NUXT_PUBLIC_COURSES_PUBLIC === "true"

// The mock gateway exists only in mock mode (spec, „Mock gateway"), so a
// sandbox or production build contains neither its page nor its routes. The
// runtime-config schema is the second guard: it refuses `mock` outside
// development.
//
// The layer is nested here rather than in `layers/`, where discovery is
// automatic and this decision could not be made — and because it is nested,
// the path has to be absolute: a relative one resolves against the project
// root, not the layer.
const mockGateway =
  process.env.NUXT_GOPAY_ENV === "mock"
    ? [fileURLToPath(new URL("mock-gopay", import.meta.url))]
    : []

// Marker so Nuxt registers this directory as a layer. Owns catalog,
// checkout, payments, invoicing (areas 03–05).
export default defineNuxtConfig({
  extends: mockGateway,

  routeRules: coursesPublic
    ? {}
    : {
        "/kurzy": { robots: false },
        "/kurzy/**": { robots: false },
      },

  // The layer contributes its own sitemap source: Nuxt merges layer config
  // with defu, so this array joins the root's rather than replacing it, and
  // the shop's URLs stay declared next to the route that serves them.
  sitemap: {
    sources: coursesPublic ? ["/api/__sitemap__/courses"] : [],
  },
})
