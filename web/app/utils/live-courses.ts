/**
 * The Live Courses that are actively sold and measured; the keys are the ids
 * Meta and SimpleShop see. See docs/analytics.md, „Live Course tracking table".
 */
export const LIVE_COURSES = {
  "online-3-7-2027-01": {
    name: "Online kurz pro rodiče dětí 3–7 let",
    startDate: "11. 1. 2027",
    buyUrl: "https://form.simpleshop.cz/yXRL9/buy/",
  },
  "nazivo-2-5-hk-2026-10": {
    name: "Kurz (ne)hubnutí naživo 2.–5. třída, Hradec Králové",
    startDate: "5. 10. 2026",
    buyUrl: "https://form.simpleshop.cz/JmEVq/buy/",
  },
  // Taken off the site (no page, no buy link); the entry stays so the
  // thank-you page still names the course for buyers who ordered earlier.
  "nazivo-6-9-hk-2026-09": {
    name: "Kurz (ne)hubnutí naživo 6.–9. třída, Hradec Králové",
    startDate: "22. 9. 2026",
    buyUrl: "https://form.simpleshop.cz/RYlVD/buy/",
  },
} as const

export type LiveCourseId = keyof typeof LIVE_COURSES

/**
 * Narrows an unvalidated value — the thank-you page's `kurz` query parameter —
 * to a Live Course id, so an unknown or missing one falls back instead of
 * indexing the table with a cast.
 */
export function isLiveCourseId(value: unknown): value is LiveCourseId {
  return typeof value === "string" && Object.hasOwn(LIVE_COURSES, value)
}
