import { describe, expect, it } from "vitest"
import {
  COVER_FILE_ID,
  MATERIAL_FILE_ID,
  PUBLIC_COURSES_FOLDER_ID,
  PUBLISHED_SLUG,
  item,
  items,
  probe,
  probeStatus,
} from "./support"

// Anonymous (public role) access to course covers and the enriched sales
// fixture. The public policy's directus_files read rule is folder-scoped by
// name (`Public` plus one level below), so a cover only loads on the site
// when it lives in `Public/kurzy`; a file in the author's materials folder
// must stay unreachable. See docs/directus.md ("Roles and file scoping").

describe("anonymous cover access", () => {
  it("serves a file stored in Public/kurzy", async () => {
    expect(await probeStatus(`/assets/${COVER_FILE_ID}`)).toBe(200)
  })

  it("lists the cover's folder as Public/kurzy", async () => {
    const response = await probe(`/files/${COVER_FILE_ID}?fields=folder`)
    expect(response.status).toBe(200)
    expect(item(response).folder).toBe(PUBLIC_COURSES_FOLDER_ID)
  })

  it("refuses a file stored in the materials folder", async () => {
    expect(await probeStatus(`/assets/${MATERIAL_FILE_ID}`)).toBe(403)
  })
})

describe("anonymous sales fixture", () => {
  it("reads teaser, price, cover and a mixed outline of the published course", async () => {
    const response = await probe(
      `/items/course?filter[slug][_eq]=${PUBLISHED_SLUG}` +
        "&fields=description,price_czk,sort,cover.id,sections.lessons.type",
    )
    expect(response.status).toBe(200)
    const [course] = items(response)
    expect(typeof course.description).toBe("string")
    expect(course.description).not.toMatch(/<[a-z]+>/i)
    expect(course.price_czk).toBe(1490)
    expect(typeof course.sort).toBe("number")
    expect((course.cover as { id: string }).id).toBe(COVER_FILE_ID)
    const sections = course.sections as { lessons: { type: string }[] }[]
    expect(sections.length).toBeGreaterThanOrEqual(2)
    const lessons = sections.flatMap((section) => section.lessons)
    const types = new Set(lessons.map((lesson) => lesson.type))
    expect(types).toEqual(new Set(["video", "text"]))
  })
})
