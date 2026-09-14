import { readItems } from "@directus/sdk"

// The sitemap's runtime source (spec, "Metadata and structured data"):
// every published Course, so a Course goes live in `sitemap.xml` the moment
// it is published, with no deploy. Registered in the shop layer's
// `nuxt.config.ts` under `sitemap.sources`.
//
// Anonymous client on purpose, never the caller's: the sitemap is public
// data and must read the same for everyone, so an Author's session fetching
// it must not leak their drafts. The status filter is belt and braces on top
// of the public policy, which already returns published rows only. No
// `lastmod`: the public policy does not expose `date_updated`.
export default defineSitemapEventHandler(async (event) => {
  const client = getDirectusAnonymousServerClient(event)
  const rows = await client.request(
    readItems("course", {
      fields: ["slug"],
      filter: { status: { _eq: "published" } },
      limit: -1,
    }),
  )
  return rows.map((row) => `/kurzy/${row.slug}`)
})
