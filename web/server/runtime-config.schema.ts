import { z } from "zod"

// `looseObject` lets Nuxt-module-injected runtimeConfig keys (plausible,
// sentry, og-image, ...) pass through. Only declared keys get validated.

export const publicSchema = z.looseObject({
  directusUrl: z.url(),
})

// Set to `undefined` if no private (server-only) keys need validating.
export const privateSchema: z.ZodType | undefined = undefined
