import { z } from "zod"

import { devOptional, url } from "../modules/safe-runtime-config/runtime/schema-kit"

// `looseObject` lets Nuxt-module-injected runtimeConfig keys (plausible,
// sentry, og-image, ...) pass through. Only declared keys get validated.
// Branded base schema, exported so consumers can parse-and-brand at the
// boundary (see app/utils/directus.ts).
export const directusUrlSchema = url("NUXT_PUBLIC_DIRECTUS_URL")

export const publicSchema = z.looseObject({
  // optional in dev, required at runtime; missing vs malformed are distinct.
  directusUrl: devOptional(directusUrlSchema),
})

// Set to `undefined` if no private (server-only) keys need validating.
export const privateSchema: z.ZodType | undefined = undefined
