import { readItems } from "@directus/sdk"
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

// SDK Schema-level shape: every column the SDK can address. Fetched columns
// (z.input) plus columns we filter on but don't fetch.
export type BiographyExpertCollection = z.input<typeof BiographyExpertSchema> & {
  status: string
}

const biographyExpertRequest = async () =>
  getDirectusClient().request(
    readItems("biography_expert", {
      fields: ["name", "description", "url", { photo: ["id", "width", "height", "description"] }],
      filter: {
        status: { _eq: "published" },
      },
    }),
  )

export function useBiographyExpert(): ReturnType<typeof useAsyncData<BiographyExpert[]>> {
  return useAsyncData("biographies", biographyExpertRequest, {
    transform: (input) => z.array(BiographyExpertSchema).parse(input),
  })
}
