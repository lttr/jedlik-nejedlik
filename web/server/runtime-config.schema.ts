import { z } from "zod"

import { devOptional } from "../modules/safe-runtime-config/runtime/schema-kit"

// `looseObject` lets Nuxt-module-injected runtimeConfig keys (plausible,
// sentry, og-image, ...) pass through. Only declared keys get validated.

// runtimeConfig collapses a missing NUXT_PUBLIC_DIRECTUS_URL to "", so an empty
// string IS the "missing" case. Check emptiness before the URL format so the
// two failure modes get distinct messages.
const directusUrl = z
  .string()
  .min(1, { error: "directusUrl is missing — set NUXT_PUBLIC_DIRECTUS_URL" })
  .pipe(z.url({ error: "directusUrl is not a valid URL" }))

export const publicSchema = z.looseObject({
  directusUrl: devOptional(directusUrl), // optional in dev, required at runtime
})

// Set to `undefined` if no private (server-only) keys need validating.
export const privateSchema: z.ZodType | undefined = undefined
