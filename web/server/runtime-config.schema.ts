import type { PublicRuntimeConfig } from "nuxt/schema"
import { z } from "zod"

import { url } from "../modules/safe-runtime-config/runtime/schema-kit"

// Required + valid URL in every environment. The value comes solely from
// NUXT_PUBLIC_DIRECTUS_URL; the `""` default in nuxt.config is just a structural
// placeholder so the env override has a key to target. Boot validation throws
// on a missing/malformed value (dev and prod alike), so no running process can
// observe a non-URL.
const directusUrlSchema = url("NUXT_PUBLIC_DIRECTUS_URL")

// Standalone object so its keys stay precisely inferable. `looseObject` (below)
// lets Nuxt-module-injected keys (plausible, sentry, og-image, ...) pass
// through; only these declared keys get validated.
const publicFields = {
  directusUrl: directusUrlSchema,
}

export const publicSchema = z.looseObject(publicFields)

// Set to `undefined` if no private (server-only) keys need validating.
export const privateSchema: z.ZodType | undefined = undefined

// Brand the runtime value from the schema so the whole app sees a validated
// `Url`, not a bare string, when reading `useRuntimeConfig().public.directusUrl`.
// Sound because boot validation refuses to start the server on a non-URL.
declare module "nuxt/schema" {
  interface SharedPublicRuntimeConfig {
    directusUrl: z.infer<typeof directusUrlSchema>
  }
}

// Compile-time guard against schema/nuxt.config key drift: every key this
// schema validates must exist on Nuxt's generated PublicRuntimeConfig. Catches
// typos like `directusUrl` → `directusurl` in nuxt.config that would otherwise
// only surface at boot as a misleading "is missing" error (the env override
// silently stops resolving, and looseObject swallows the orphaned key).
//
// PublicRuntimeConfig carries a `[key: string]` index signature (so arbitrary
// runtimeConfig keys type-check), which widens `keyof` to `string`. Strip it so
// the guard sees only the keys Nuxt actually generated from nuxt.config.
type ExplicitKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}
type _DeclaredKeysExist = keyof typeof publicFields extends keyof ExplicitKeys<PublicRuntimeConfig>
  ? true
  : ["runtime-config key drift: schema key missing from nuxt.config", never]
const _assertDeclaredKeysExist: _DeclaredKeysExist = true
