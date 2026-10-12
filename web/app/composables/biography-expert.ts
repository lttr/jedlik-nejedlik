import { readItems } from "@directus/sdk"
import type { AsyncData, NuxtError } from "nuxt/app"
import { z } from "zod"
import { useReportedAsyncData } from "#layers/base/app/composables/reported-fetch"
import { getDirectusClient } from "#layers/directus/app/utils/directus"
import { BiographyExpertSchema } from "#layers/directus/shared/utils/schemas"
import type { BiographyExpert } from "#layers/directus/shared/utils/schemas"

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
  const result = useReportedAsyncData(key, biographyExpertRequest, {
    transform: (input) => z.array(BiographyExpertSchema).parse(input),
  })
  return result
}
