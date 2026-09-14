import { readItems } from "@directus/sdk"

// The Sales Page (spec, "Routes and navigation"). The caller's own session
// decides what Directus returns, so a draft is readable by its Author and
// absent for everyone else. Absent means 404, the same 404 as a slug that
// never existed: a visitor cannot confirm a draft this way.
export default defineEventHandler(async (event): Promise<SalesCourse> => {
  const slug = getRouterParam(event, "slug") ?? ""
  const client = await getCallerDirectusClient(event)
  const rows = await client.request(
    readItems("course", {
      fields: [
        ...COURSE_PUBLIC_FIELDS,
        {
          sections: [
            "id",
            "course",
            "title",
            "sort",
            { lessons: ["id", "section", "title", "sort", "type"] },
          ],
        },
      ],
      filter: { status: { _in: SHOP_COURSE_STATUSES }, slug: { _eq: slug } },
      limit: 1,
    }),
  )
  const row = rows[0]
  if (row === undefined) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" })
  }
  return parseSalesCourse(row)
})
