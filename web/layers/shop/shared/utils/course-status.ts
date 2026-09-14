import { CourseStatusSchema } from "../../../directus/shared/utils/schemas"

// The statuses the shop asks Directus for (spec, "Scope of the Catalog"),
// spread out of the codec so the filter and the parsers are the same list.
// Shared by the Catalog and the Sales Page routes so a visitor cannot reach
// through one what the other hides.
export const SHOP_COURSE_STATUSES = [...CourseStatusSchema.options]
