import { readFile } from "@directus/sdk"
import type { AsyncData, NuxtError } from "nuxt/app"

export async function useDirectusImage(
  id: string,
): Promise<AsyncData<Image | undefined, NuxtError | undefined>> {
  const key = `image-${id}`
  const result = useAsyncData(key, async () => getDirectusClient().request(readFile(id)), {
    transform: (input) => ImageSchema.parse(input),
  })
  watchAsyncDataError(key, result.error)
  return result
}
