import { readFile } from "@directus/sdk"
import type { AsyncData, NuxtError } from "nuxt/app"
import { useReportedAsyncData } from "#layers/base/app/composables/reported-fetch"
import { getDirectusClient } from "#layers/directus/app/utils/directus"
import { ImageSchema } from "#layers/directus/shared/utils/schemas"
import type { Image } from "#layers/directus/shared/utils/schemas"

export async function useDirectusImage(
  id: string,
): Promise<AsyncData<Image | undefined, NuxtError | undefined>> {
  const key = `image-${id}`
  const result = useReportedAsyncData(key, async () => getDirectusClient().request(readFile(id)), {
    transform: (input) => ImageSchema.parse(input),
  })
  return result
}
