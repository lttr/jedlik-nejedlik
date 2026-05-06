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

const biographyExpertRequest = async () =>
  directus.request(
    readItems("biography_expert", {
      fields: ["name", "description", "url", { photo: ["id", "width", "height", "description"] }],
      filter: {
        status: { _eq: "published" },
      },
    }),
  )

export function useBiographyExpert(): ReturnType<typeof useAsyncData<BiographyExpert[]>> {
  return useAsyncData("biographies", async () => {
    // Narrowing matches the `fields` list passed to readItems above.
    // eslint-disable-next-line typescript-eslint/no-unsafe-type-assertion
    return (await biographyExpertRequest()) as BiographyExpert[]
  })
}
