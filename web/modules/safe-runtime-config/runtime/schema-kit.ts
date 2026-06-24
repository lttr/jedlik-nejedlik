import { z } from "zod"

// Helpers for authoring `server/runtime-config.schema.ts`. They hide the
// env-conditional plumbing so the schema reads as intent, not mechanics.

// Sample schema used only to name the branded type and the factory's return —
// keeps `url()` explicitly typed without spelling out zod's internal generics.
const _urlSchema = z.string().pipe(z.url()).brand<"Url">()

// A validated URL string, branded so a checked URL is nominally distinct from
// an arbitrary string once it has passed validation. Generic, not var-specific.
export type Url = z.infer<typeof _urlSchema>

// A required-URL field for the env var `envName`, branded as Url. Splits the
// two failure modes — empty (missing) vs non-empty-but-malformed — and names
// the var in each message. Parse it (don't cast) to mint a Url.
export function url(envName: string): typeof _urlSchema {
  return z
    .string()
    .min(1, { error: `${envName} is missing` })
    .pipe(z.url({ error: `${envName} is not a valid URL` }))
    .brand<"Url">()
}

// Required at runtime (prod), tolerated-when-absent in dev. A *malformed* value
// still fails in both — only absence (empty string / undefined, which is how a
// missing runtimeConfig var arrives) is allowed locally.
export function devOptional(schema: z.ZodType): z.ZodType {
  return import.meta.dev ? z.union([z.literal(""), z.undefined(), schema]) : schema
}
