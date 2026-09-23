import { readItems } from "@directus/sdk"
import { COURSE_PUBLIC_FIELDS, SHOP_COURSE_STATUSES } from "../utils/course-query"
import { getCallerDirectusClient } from "#layers/auth/server/utils/caller-client"
import { parseCatalogCourse } from "#layers/shop/shared/utils/catalog"
import type { CatalogCourse } from "#layers/shop/shared/utils/catalog"
import { compareCatalogOrder } from "#layers/shop/shared/utils/catalog-order"

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
