import { readItems } from "@directus/sdk"
import type { AsyncData, NuxtError } from "nuxt/app"
import { z } from "zod"

export type Photo = Image

// Consumer contract: optional keys (omitted when null on the wire).
export interface BiographyExpert {
  name: string
  description?: string
  url?: string
  photo?: Photo
}

// Parses the fetched response and normalises null → undefined for consumers.
const BiographyExpertSchema = z
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

// The return annotation is a compile-time drift guard: the item shape the SDK
// derives from the layer's hand-written BiographyExpertCollection wire type
// must stay assignable to this zod schema's input (the layer cannot use zod).
const biographyExpertRequest = async (): Promise<z.input<typeof BiographyExpertSchema>[]> =>
  getDirectusClient().request(
    readItems("biography_expert", {
      fields: ["name", "description", "url", { photo: ["id", "width", "height", "description"] }],
      filter: {
        status: { _eq: "published" },
      },
    }),
  )

export async function useBiographyExpert(): Promise<
  AsyncData<BiographyExpert[] | undefined, NuxtError | undefined>
> {
  const key = "biographies"
  const result = useAsyncData(key, biographyExpertRequest, {
    transform: (input) => z.array(BiographyExpertSchema).parse(input),
  })
  watchAsyncDataError(key, result.error)
  return result
}
