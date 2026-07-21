import { z } from "zod"

// Wire codecs: parse Directus responses and normalise null → undefined so
// consumers get idiomatic optional keys. These are the single source of
// truth for the collection shapes — wire types in ../types/directus.ts
// derive from their inputs, consumer contracts from their outputs.

// Subset of the `directus_files` columns the app actually consumes. `id` is
// mandatory; the rest are NULLable in the database.
export const ImageSchema = z
  .object({
    id: z.string(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    description: z.string().nullable(),
  })
  .transform((o) => ({
    id: o.id,
    width: o.width ?? undefined,
    height: o.height ?? undefined,
    description: o.description ?? undefined,
  }))

export type Image = z.output<typeof ImageSchema>

// Consumer contract: optional keys (omitted when null on the wire).
export interface BiographyExpert {
  name: string
  description?: string
  url?: string
  photo?: Image
}

export const BiographyExpertSchema = z
  .object({
    name: z.string(),
    description: z.string().nullable(),
    url: z.string().nullable(),
    photo: ImageSchema.nullable(),
  })
  .transform(
    (o): BiographyExpert => ({
      name: o.name,
      description: o.description ?? undefined,
      url: o.url ?? undefined,
      photo: o.photo ?? undefined,
    }),
  )
