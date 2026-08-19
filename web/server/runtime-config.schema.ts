// Runtime config schema for the @lttr/nuxt-validated-runtime-config module. See
// that module's README for the authoring conventions and the why behind each
// piece.
import { z } from "zod"

import { definePublicSchema, url } from "@lttr/nuxt-validated-runtime-config/schema"
import type { Url } from "@lttr/nuxt-validated-runtime-config/schema"

export const publicSchema = definePublicSchema({
  directusUrl: url("DIRECTUS_URL", { public: true }),
})

// `directusServiceToken` is typed by Nuxt itself from the customers layer's
// `runtimeConfig` — only the branded public keys below need a hand-written
// augmentation.
export const privateSchema: z.ZodType | undefined = z.looseObject({
  directusServiceToken: z.string().min(1, { error: "NUXT_DIRECTUS_SERVICE_TOKEN is missing" }),
})

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    // `url()` brands its output as `Url`; keep the augmentation in sync by hand.
    directusUrl: Url
  }
}
