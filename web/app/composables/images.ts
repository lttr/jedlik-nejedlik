import { readFile } from "@directus/sdk"
import { z } from "zod"

// Subset of the `directus_files` columns the app actually consumes. `id` is
// mandatory; the rest are NULLable in the database. Output is normalised to
// `undefined` so consumers can use idiomatic optional chaining / `?:`.
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

export type Image = z.infer<typeof ImageSchema>

export async function useDirectusImage(id: string): Promise<{
  data: Ref<Image>
}> {
  return useAsyncData(`image-${id}`, async () => getDirectusClient().request(readFile(id)), {
    transform: (input) => ImageSchema.parse(input),
  })
}
