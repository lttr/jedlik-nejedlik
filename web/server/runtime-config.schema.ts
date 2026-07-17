// Runtime config schema for the @lttr/nuxt-validated-runtime-config module. See
// that module's README for the authoring conventions and the why behind each
// piece.
import type { z } from "zod"

import { definePublicSchema, url } from "@lttr/nuxt-validated-runtime-config/schema"
import type { Url } from "@lttr/nuxt-validated-runtime-config/schema"

export const publicSchema = definePublicSchema({
  directusUrl: url("DIRECTUS_URL", { public: true }),
})

export const privateSchema: z.ZodType | undefined = undefined

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    // `url()` brands its output as `Url`; keep the augmentation in sync by hand.
    directusUrl: Url
  }
}
