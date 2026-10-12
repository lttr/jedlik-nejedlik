import { defineEventHandler } from "nuxt/server"
import { readItems } from "@directus/sdk"
import { getDirectusAnonymousServerClient } from "#layers/directus/server/utils/directus-server"

// Every published Course, so a Course reaches `sitemap.xml` without a deploy.
// Anonymous client on purpose: the sitemap is public and must read the same
// for everyone. See docs/shop.md, „Sitemap and metadata“.
export default defineEventHandler(async (): Promise<string[]> => {
  const client = getDirectusAnonymousServerClient()
  const rows = await client.request(
    readItems("course", {
      fields: ["slug"],
      filter: { status: { _eq: "published" } },
      limit: -1,
    }),
  )
  return rows.map((row) => `/kurzy/${row.slug}`)
})
