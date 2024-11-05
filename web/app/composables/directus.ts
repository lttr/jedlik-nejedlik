import { createDirectus, rest } from "@directus/sdk"

export const directus = createDirectus(DIRECTUS_URL).with(rest())
