import { createDirectus, rest } from "@directus/sdk"
import { DIRECTUS_URL } from "~/utils/directus"

export const directus = createDirectus(DIRECTUS_URL).with(rest())
