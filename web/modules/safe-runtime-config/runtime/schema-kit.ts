import type { PublicRuntimeConfig } from "nuxt/schema"
import { z } from "zod"

// Helpers for authoring `server/runtime-config.schema.ts`. They hide the
// validation, branding and key-drift plumbing so the schema reads as intent,
// not mechanics.

// Type witness for `url()`: the structure (string → url → brand) is identical
// across calls — only the per-call error messages differ, and those don't
// affect the type. Naming it here gives `url()` an explicit return type (the
// `explicit-module-boundary-types` lint requires one) and names `Url`, without
// spelling out zod's internal generics.
const _urlSchema = z.string().pipe(z.url()).brand<"Url">()

// A validated URL string, branded so a checked URL is nominally distinct from
// an arbitrary string once it has passed validation. Generic, not var-specific.
export type Url = z.infer<typeof _urlSchema>

// A required-URL field for the env var `envName`, branded as Url. Splits the
// two failure modes — empty (missing) vs non-empty-but-malformed — and names
// the var in each message.
export function url(envName: string): typeof _urlSchema {
  return z
    .string()
    .min(1, { error: `${envName} is missing` })
    .pipe(z.url({ error: `${envName} is not a valid URL` }))
    .brand<"Url">()
}

// Keys Nuxt actually generated from `nuxt.config` runtimeConfig.public. The
// `[key: string]` index signature (which lets arbitrary keys type-check) is
// stripped so the set stays finite — otherwise `keyof` widens to `string` and
// the drift check below becomes vacuous.
type DeclaredPublicKeys = keyof {
  [K in keyof PublicRuntimeConfig as string extends K
    ? never
    : number extends K
      ? never
      : K]: PublicRuntimeConfig[K]
}

// Reject any field whose key isn't a declared public runtimeConfig key, so a
// schema/nuxt.config typo (e.g. `directusUrl` → `directusurl`) fails to compile
// here instead of surfacing at boot as a misleading "is missing" error.
type ValidatePublicFields<F> = {
  [K in keyof F]: K extends DeclaredPublicKeys
    ? F[K]
    : ["runtime-config key drift: key not declared in nuxt.config", never]
}

// Build the public runtime-config schema from `fields`. `looseObject` lets
// Nuxt-module-injected keys (plausible, sentry, og-image, ...) pass through;
// only the declared fields get validated. The generic constraint is the
// key-drift guard.
export function definePublicSchema<F extends z.ZodRawShape>(
  fields: F & ValidatePublicFields<F>,
): z.ZodType {
  return z.looseObject(fields as F)
}
