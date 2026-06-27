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

export interface FieldOptions {
  // Public keys map to a `NUXT_PUBLIC_`-prefixed env var, private keys to
  // `NUXT_` — matching Nuxt's runtimeConfig env-override convention.
  public?: boolean
}

// Resolve the runtime base name (e.g. `DIRECTUS_URL`) to the exact env var Nuxt
// reads, so callers name the field, not the prefix mechanics.
function envName(name: string, { public: isPublic = false }: FieldOptions): string {
  return isPublic ? `NUXT_PUBLIC_${name}` : `NUXT_${name}`
}

// A required-URL field for the env var derived from `name` (+ public/private
// prefix), branded as Url. Splits the two failure modes — empty (missing) vs
// non-empty-but-malformed — and names the resolved var in each message.
export function url(name: string, options: FieldOptions = {}): typeof _urlSchema {
  const env = envName(name, options)
  return z
    .string()
    .min(1, { error: `${env} is missing` })
    .pipe(z.url({ error: `${env} is not a valid URL` }))
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
//
// Fail open when `DeclaredPublicKeys` is `never`: that means the generated
// `.nuxt/types/runtime-config.d.ts` (which contributes the literal keys) isn't
// in the current program and `PublicRuntimeConfig` is only its `[key: string]`
// index signature. That happens in the editor's per-file tsserver program,
// where applying the guard would wrongly flag every field as drift. The full
// `nuxi typecheck` does pull in the generated types, so the guard still bites
// there.
type ValidatePublicFields<F> = [DeclaredPublicKeys] extends [never]
  ? F
  : {
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
