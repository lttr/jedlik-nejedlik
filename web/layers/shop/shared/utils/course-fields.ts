// The Course columns both shop routes select. Kept in one place next to the
// codecs: `CourseSchema` gaining a column has to reach the Catalog and the
// Sales Page together, or whichever route was forgotten throws at parse time.
// `status` is not here — only the Catalog renders it (the „Koncept" badge).
export const COURSE_PUBLIC_FIELDS = [
  "id",
  "sort",
  "title",
  "slug",
  "description",
  "price_czk",
  { cover: ["id", "width", "height", "description"] },
] as const
