/**
 * The Live Courses that are actively sold and measured.
 *
 * Five hardcoded facts per course, read by the buy link and the thank-you page,
 * so they live here rather than in Directus. Not in the `shop` layer either:
 * this table gets deleted, not extended, once the checkout moves in-house.
 *
 * The keys are the ids Meta sees as the event's content name and SimpleShop
 * passes back in the `kurz` query parameter. They are anchored on the start
 * date, not the sales season, so they diverge on purpose from route slugs.
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
  "nazivo-6-9-hk-2026-09": {
    name: "Kurz (ne)hubnutí naživo 6.–9. třída, Hradec Králové",
    startDate: "22. 9. 2026",
    buyUrl: "https://form.simpleshop.cz/RYlVD/buy/",
  },
} as const

export type LiveCourseId = keyof typeof LIVE_COURSES
