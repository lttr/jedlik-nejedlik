import { readFile } from "@directus/sdk"
import { directus } from "./directus"

export interface Image {
  id: string
  title?: string
  description?: string
  width?: number
  height?: number
  filesize?: number
  uploaded_on?: string
  modified_on?: string
  storage?: string
  filename_disk?: string
  filename_download?: string
  mime_type?: string
  focal_point_x?: number
  focal_point_y?: number
  tags?: string[]
}

export async function useDirectusImage(id: string): Promise<{
  data: Ref<Image | null>
}> {
  return await useAsyncData(`image-${id}`, async () => {
    return await directus.request(readFile(id))
  })
}
