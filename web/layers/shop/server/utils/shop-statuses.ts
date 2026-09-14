// The statuses the shop asks Directus for (spec, "Scope of the Catalog"). An
// explicit list rather than every row: `published` is what a visitor may
// read anyway, and `draft` only ever comes back for an Author's own token,
// because the public policy filters on published (ADR 0004). Any status
// added later (archived, a Live Course marker) stays out of the shop until
// someone lists it here. Shared by the Catalog and the Sales Page routes so
// a visitor cannot reach through one what the other hides.
export const SHOP_COURSE_STATUSES = ["published", "draft"]
