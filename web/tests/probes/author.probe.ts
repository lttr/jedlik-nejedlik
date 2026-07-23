import { afterAll, describe, expect, it } from "vitest"
import { probe, probeSend, probeUpload, roleToken } from "./support"

// Author-role permission matrix: full content CRUD (course/section/lesson,
// Materials junction, file uploads), read-only transactional collections,
// the manual Entitlement grant/revoke path, and no instance administration.
// Relies on the [TEST]-marked fixtures on the production instance. See
// .aiwork/2026-07-22_directus-data-model/implementation-notes.md.
//
// Required environment (static tokens, never committed):
//   DIRECTUS_PROBE_AUTHOR_TOKEN  probe-author@jedlik-nejedlik.cz (role Autor)
//   DIRECTUS_PROBE_ADMIN_TOKEN   admin token (cleanup safety net)

const AUTHOR = roleToken("DIRECTUS_PROBE_AUTHOR_TOKEN")
const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")

// Stable fixture identifiers on the production instance (not secrets).
const ENTITLED_ID = "42ea0c6c-9e85-4ae1-a63d-336dc63a8b54"
const UNENTITLED_ID = "70975566-e359-4d67-9bf7-81d69d5b8a79"
const PUBLISHED_COURSE_ID = 1
const MATERIALS_FOLDER_ID = "6173b74f-9990-41a2-b931-ff591ee6a5ed"

// Everything the suite creates, removed again by the author within the tests
// themselves; the afterAll admin sweep only fires if a test failed mid-way.
const leftovers = {
  courses: [] as number[],
  files: [] as string[],
  entitlements: [] as number[],
}

afterAll(async () => {
  for (const id of leftovers.entitlements) {
    await probeSend("DELETE", `/items/entitlement/${id}`, undefined, ADMIN)
  }
  for (const id of leftovers.courses) {
    await probeSend("DELETE", `/items/course/${id}`, undefined, ADMIN)
  }
  for (const id of leftovers.files) {
    await probeSend("DELETE", `/files/${id}`, undefined, ADMIN)
  }
})

function items(response: { body: { data?: unknown } }): Record<string, unknown>[] {
  expect(Array.isArray(response.body.data)).toBe(true)
  return response.body.data as Record<string, unknown>[]
}

function item(response: { body: { data?: unknown } }): Record<string, unknown> {
  return response.body.data as Record<string, unknown>
}

function forget<T>(list: T[], value: T) {
  list.splice(list.indexOf(value), 1)
}

describe("author content management", () => {
  let courseId: number
  let sectionId: number
  let lessonId: number
  let junctionId: number
  let materialFileId: string

  it("creates a draft course", async () => {
    const response = await probeSend(
      "POST",
      "/items/course",
      {
        status: "draft",
        title: "[TEST] Autor probe kurz",
        slug: `test-autor-probe-${Date.now()}`,
        price_czk: 990,
        test_pass_threshold: 70,
      },
      AUTHOR,
    )
    expect(response.status).toBe(200)
    courseId = item(response).id as number
    leftovers.courses.push(courseId)
  })

  it("reads the draft course including config fields", async () => {
    const response = await probe(
      `/items/course/${courseId}?fields=id,status,title,test_pass_threshold`,
      AUTHOR,
    )
    expect(response.status).toBe(200)
    expect(item(response).status).toBe("draft")
    expect(item(response).test_pass_threshold).toBe(70)
  })

  it("updates the course", async () => {
    const response = await probeSend(
      "PATCH",
      `/items/course/${courseId}`,
      { description: "<p>Upraveno probem</p>" },
      AUTHOR,
    )
    expect(response.status).toBe(200)
  })

  it("creates a section with an unlock rule", async () => {
    const response = await probeSend(
      "POST",
      "/items/section",
      { course: courseId, title: "[TEST] Sekce", sort: 1, unlock_rule: "manual" },
      AUTHOR,
    )
    expect(response.status).toBe(200)
    sectionId = item(response).id as number
  })

  it("creates and updates a text lesson", async () => {
    const created = await probeSend(
      "POST",
      "/items/lesson",
      { section: sectionId, title: "[TEST] Lekce", sort: 1, type: "text", body: "<p>Text</p>" },
      AUTHOR,
    )
    expect(created.status).toBe(200)
    lessonId = item(created).id as number
    const updated = await probeSend(
      "PATCH",
      `/items/lesson/${lessonId}`,
      { body: "<p>Upraveno</p>" },
      AUTHOR,
    )
    expect(updated.status).toBe(200)
  })

  it("uploads a Material file into the course-materials folder", async () => {
    const response = await probeUpload(
      AUTHOR,
      { name: "test-autor-probe.txt", content: "probe material", type: "text/plain" },
      { title: "[TEST] Autor probe material", folder: MATERIALS_FOLDER_ID },
    )
    expect(response.status).toBe(200)
    materialFileId = item(response).id as string
    leftovers.files.push(materialFileId)
    expect(item(response).folder).toBe(MATERIALS_FOLDER_ID)
  })

  it("attaches the Material to the lesson and reads it back", async () => {
    const attached = await probeSend(
      "POST",
      "/items/lesson_material",
      { lesson_id: lessonId, directus_files_id: materialFileId },
      AUTHOR,
    )
    expect(attached.status).toBe(200)
    junctionId = item(attached).id as number
    const lesson = await probe(
      `/items/lesson/${lessonId}?fields=id,materials.directus_files_id`,
      AUTHOR,
    )
    expect(lesson.status).toBe(200)
    const materials = item(lesson).materials as { directus_files_id: string }[]
    expect(materials.map((m) => m.directus_files_id)).toContain(materialFileId)
  })

  it("deletes lesson, section, and course", async () => {
    expect(
      (await probeSend("DELETE", `/items/lesson_material/${junctionId}`, undefined, AUTHOR)).status,
    ).toBe(204)
    expect((await probeSend("DELETE", `/items/lesson/${lessonId}`, undefined, AUTHOR)).status).toBe(
      204,
    )
    expect(
      (await probeSend("DELETE", `/items/section/${sectionId}`, undefined, AUTHOR)).status,
    ).toBe(204)
    expect((await probeSend("DELETE", `/items/course/${courseId}`, undefined, AUTHOR)).status).toBe(
      204,
    )
    forget(leftovers.courses, courseId)
  })

  it("deletes files inside the materials folder only", async () => {
    const inFolder = await probeSend("DELETE", `/files/${materialFileId}`, undefined, AUTHOR)
    expect(inFolder.status).toBe(204)
    forget(leftovers.files, materialFileId)

    const stray = await probeUpload(AUTHOR, {
      name: "test-autor-probe-stray.txt",
      content: "outside folder",
      type: "text/plain",
    })
    expect(stray.status).toBe(200)
    const strayId = item(stray).id as string
    leftovers.files.push(strayId)
    const denied = await probeSend("DELETE", `/files/${strayId}`, undefined, AUTHOR)
    expect(denied.status).toBe(403)
    expect((await probeSend("DELETE", `/files/${strayId}`, undefined, ADMIN)).status).toBe(204)
    forget(leftovers.files, strayId)
  })
})

describe("author transactional boundaries", () => {
  it("reads orders, consents, and entitlements", async () => {
    for (const collection of ["order", "order_consent", "entitlement"]) {
      const response = await probe(`/items/${collection}?limit=-1`, AUTHOR)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.data)).toBe(true)
    }
    const fixture = await probe("/items/entitlement?fields=student,course&limit=-1", AUTHOR)
    expect(items(fixture)).toContainEqual({ student: ENTITLED_ID, course: PUBLISHED_COURSE_ID })
  })

  it("denies creating an order", async () => {
    const response = await probeSend(
      "POST",
      "/items/order",
      { student: UNENTITLED_ID, course: PUBLISHED_COURSE_ID, price_czk: 1 },
      AUTHOR,
    )
    expect(response.status).toBe(403)
  })

  it("denies updating and deleting orders", async () => {
    expect((await probeSend("PATCH", "/items/order/1", { status: "paid" }, AUTHOR)).status).toBe(
      403,
    )
    expect((await probeSend("DELETE", "/items/order/1", undefined, AUTHOR)).status).toBe(403)
  })

  it("denies creating a consent record", async () => {
    const response = await probeSend(
      "POST",
      "/items/order_consent",
      { order: 1, document: "terms", document_version: "x", granted_at: "2026-07-23T00:00:00Z" },
      AUTHOR,
    )
    expect(response.status).toBe(403)
  })

  it("denies updating an entitlement", async () => {
    const fixture = await probe("/items/entitlement?fields=id&limit=1", AUTHOR)
    const response = await probeSend(
      "PATCH",
      `/items/entitlement/${items(fixture)[0].id}`,
      { granted_at: "2030-01-01T00:00:00Z" },
      AUTHOR,
    )
    expect(response.status).toBe(403)
  })
})

describe("author manual entitlement grant", () => {
  it("grants and revokes an entitlement, granted_at defaulting to now", async () => {
    const granted = await probeSend(
      "POST",
      "/items/entitlement",
      { student: UNENTITLED_ID, course: PUBLISHED_COURSE_ID },
      AUTHOR,
    )
    expect(granted.status).toBe(200)
    const id = item(granted).id as number
    leftovers.entitlements.push(id)
    // The permission preset fills granted_at with $NOW; no manual input.
    const grantedAt = new Date(item(granted).granted_at as string).getTime()
    expect(Math.abs(Date.now() - grantedAt)).toBeLessThan(5 * 60 * 1000)

    const revoked = await probeSend("DELETE", `/items/entitlement/${id}`, undefined, AUTHOR)
    expect(revoked.status).toBe(204)
    forget(leftovers.entitlements, id)
  })
})

describe("author is not an administrator", () => {
  it("denies schema changes", async () => {
    const response = await probeSend(
      "POST",
      "/collections",
      { collection: "author_probe_hack", schema: {}, meta: {} },
      AUTHOR,
    )
    expect(response.status).toBe(403)
  })

  it("denies permission changes", async () => {
    const response = await probeSend(
      "POST",
      "/permissions",
      { collection: "order", action: "update", fields: ["*"] },
      AUTHOR,
    )
    expect(response.status).toBe(403)
  })

  it("sees only name and email of other users", async () => {
    const response = await probe(`/users/${ENTITLED_ID}?fields=email,role,token`, AUTHOR)
    expect(response.status).toBe(403)
  })
})
