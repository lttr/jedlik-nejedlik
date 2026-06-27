// Runtime config schema for the safe-runtime-config module. See that module's
// README for the authoring conventions and the why behind each piece.
import type { z } from "zod"

import { definePublicSchema, url } from "../modules/safe-runtime-config/runtime/schema-kit"

const directusUrlSchema = url("NUXT_PUBLIC_DIRECTUS_URL")

export const publicSchema = definePublicSchema({
  directusUrl: directusUrlSchema,
})

export const privateSchema: z.ZodType | undefined = undefined

declare module "nuxt/schema" {
  interface SharedPublicRuntimeConfig {
    directusUrl: z.infer<typeof directusUrlSchema>
  }
}
