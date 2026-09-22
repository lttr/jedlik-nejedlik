import { readItems } from "@directus/sdk"

export default defineEventHandler(async (event): Promise<CatalogCourse[]> => {
  const client = await getCallerDirectusClient(event)
  const rows = await client.request(
    readItems("course", {
      fields: [...COURSE_PUBLIC_FIELDS, "status", { sections: [{ lessons: ["id"] }] }],
      filter: { status: { _in: SHOP_COURSE_STATUSES } },
      // Order is the comparator's, not the database's: null placement on an
      // ascending sort is Postgres's choice, and the whole list is fetched
      // anyway, so there is nothing for a `sort` option to decide here.
      limit: -1,
    }),
  )
  return rows.map((row) => parseCatalogCourse(row)).toSorted(compareCatalogOrder)
})
