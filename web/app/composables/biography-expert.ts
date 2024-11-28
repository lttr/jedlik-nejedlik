import { readItems } from "@directus/sdk"
import { directus } from "./directus"

export interface Photo {
  id: string
  width: number
  height: number
  description?: string
}

export interface BiographyExpert {
  name: string
  description?: string
  photo?: Photo
  url?: string
}

const biographyExpertRequest = () =>
  directus.request(
    readItems("biography_expert", {
      fields: [
        "name",
        "description",
        "url",
        "photo.id",
        "photo.width",
        "photo.height",
        "photo.description",
      ],
    }),
  ) as Promise<BiographyExpert[]>

export async function useBiographyExpert() {
  return useAsyncData<BiographyExpert[]>("biographies", async () => {
    return await biographyExpertRequest()
  })
}
