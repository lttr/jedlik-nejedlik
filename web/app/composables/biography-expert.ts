import { readItems } from "@directus/sdk"
import type { AsyncData, NuxtError } from "nuxt/app"
import { z } from "zod"

const biographyExpertRequest = async () =>
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
