// Runtime config schema for the @lttr/nuxt-validated-runtime-config module. See
// that module's README for the authoring conventions and the why behind each
// piece.
import { z } from "zod"

import { definePublicSchema, url } from "@lttr/nuxt-validated-runtime-config/schema"
import type { Url } from "@lttr/nuxt-validated-runtime-config/schema"

export const publicSchema = definePublicSchema({
  directusUrl: url("DIRECTUS_URL", { public: true }),
})

// `nuxt-auth-utils` seals the session cookie with `session.password`
// (NUXT_SESSION_PASSWORD). A weak or absent key would silently downgrade every
// Student session, so boot refuses to start without a real one. The module
// generates a value into `web/.env` in dev; production must set it explicitly.
//
// Loose objects: other modules contribute their own private keys and must pass
// through untouched. This lives here rather than in the customers layer because
// the module reads exactly one schema file, `~~/server/runtime-config.schema`.
export const privateSchema: z.ZodType | undefined = z.looseObject({
  session: z.looseObject({
    password: z.string().min(32, "NUXT_SESSION_PASSWORD is missing or shorter than 32 characters"),
  }),
})

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    // `url()` brands its output as `Url`; keep the augmentation in sync by hand.
    directusUrl: Url
  }
}
