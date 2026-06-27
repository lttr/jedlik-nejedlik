import { z } from "zod"

// Helpers for authoring `server/runtime-config.schema.ts`. They hide the
// env-conditional plumbing so the schema reads as intent, not mechanics.

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
