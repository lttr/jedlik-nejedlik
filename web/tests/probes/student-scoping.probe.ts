import { afterAll, describe, expect, it } from "vitest"
import {
  DRAFT_SLUG,
  ENTITLED_ID,
  MATERIAL_FILE_ID,
  PUBLISHED_COURSE_ID,
  UNENTITLED_ID,
  errorCode,
  item,
  items,
  nonEmptyItems,
  probe,
  probeSend,
  probeStatus,
  roleToken,
} from "./support"

// Student-role permission matrix for the transactional collections and the
// entitlement-gated lesson content. Relies on the [TEST]-marked fixtures on
// the production instance: two Student users (one with an admin-granted
// Entitlement to course 1, one without) and the seed data from ticket 02.
// See .aiwork/2026-07-22_directus-data-model/implementation-notes.md.
//
// Required environment (static tokens of the fixture users, never committed):
//   DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN    probe-student-entitled@jedlik-nejedlik.cz
//   DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN  probe-student-unentitled@jedlik-nejedlik.cz
//   DIRECTUS_PROBE_ADMIN_TOKEN               admin token (uniqueness fixtures + cleanup)

const ENTITLED = roleToken("DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN")
const UNENTITLED = roleToken("DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN")
const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")

// Orders created during the run; deleted (consents cascade) in afterAll.
const createdOrders: number[] = []

afterAll(async () => {
  if (createdOrders.length > 0) {
    const response = await probeSend("DELETE", "/items/order", createdOrders, ADMIN)
    if (response.status !== 204) {
      throw new Error(`Probe cleanup failed: DELETE /items/order returned ${response.status}`)
    }
  }
})

async function createOrder(token: string, payload: Record<string, unknown>) {
  const response = await probeSend("POST", "/items/order", payload, token)
  if (response.status === 200) {
    createdOrders.push(item(response).id as number)
  }
  return response
}

describe("student order creation", () => {
  it("creates an order for themselves (student preset from $CURRENT_USER)", async () => {
    const response = await createOrder(ENTITLED, { course: PUBLISHED_COURSE_ID, price_czk: 1990 })
    expect(response.status).toBe(200)
    expect(item(response).student).toBe(ENTITLED_ID)
    expect(item(response).status).toBe("created")
  })

  it("creates an order with themselves as explicit student", async () => {
    const response = await createOrder(UNENTITLED, {
      student: UNENTITLED_ID,
      course: PUBLISHED_COURSE_ID,
      price_czk: 1990,
    })
    expect(response.status).toBe(200)
    expect(item(response).student).toBe(UNENTITLED_ID)
  })

  it("denies creating an order for another student", async () => {
    const response = await createOrder(UNENTITLED, {
      student: ENTITLED_ID,
      course: PUBLISHED_COURSE_ID,
      price_czk: 1990,
    })
    expect(response.status).toBe(400)
    expect(errorCode(response)).toBe("FAILED_VALIDATION")
  })

  it("denies setting status on create", async () => {
    const response = await createOrder(ENTITLED, {
      course: PUBLISHED_COURSE_ID,
      price_czk: 1990,
      status: "paid",
    })
    expect(response.status).toBe(403)
  })

  it("denies setting gopay_payment_id on create", async () => {
    const response = await createOrder(ENTITLED, {
      course: PUBLISHED_COURSE_ID,
      price_czk: 1990,
      gopay_payment_id: "spoofed",
    })
    expect(response.status).toBe(403)
  })
})

describe("student order scoping", () => {
  it("reads own orders only", async () => {
    const own = await probe("/items/order?fields=id,student&limit=-1", ENTITLED)
    expect(own.status).toBe(200)
    expect(items(own).length).toBeGreaterThan(0)
    for (const order of items(own)) {
      expect(order.student).toBe(ENTITLED_ID)
    }
    const other = await probe("/items/order?fields=id,student&limit=-1", UNENTITLED)
    for (const order of items(other)) {
      expect(order.student).toBe(UNENTITLED_ID)
    }
  })

  it("denies reading a foreign order by id", async () => {
    const [entitledOrder] = createdOrders
    const response = await probe(`/items/order/${entitledOrder}`, UNENTITLED)
    expect(response.status).toBe(403)
  })

  it("denies updating own order status", async () => {
    const [entitledOrder] = createdOrders
    const response = await probeSend(
      "PATCH",
      `/items/order/${entitledOrder}`,
      { status: "paid" },
      ENTITLED,
    )
    expect(response.status).toBe(403)
  })

  it("denies updating own order payment fields", async () => {
    const [entitledOrder] = createdOrders
    const response = await probeSend(
      "PATCH",
      `/items/order/${entitledOrder}`,
      { gopay_payment_id: "spoofed" },
      ENTITLED,
    )
    expect(response.status).toBe(403)
  })

  it("denies deleting own order", async () => {
    const [entitledOrder] = createdOrders
    const response = await probeSend("DELETE", `/items/order/${entitledOrder}`, undefined, ENTITLED)
    expect(response.status).toBe(403)
  })
})

describe("student consent records", () => {
  it("creates consents nested inside their own order", async () => {
    const response = await createOrder(ENTITLED, {
      course: PUBLISHED_COURSE_ID,
      price_czk: 1990,
      consents: [
        { document: "terms", document_version: "2026-01", granted_at: "2026-07-22T12:00:00Z" },
        {
          document: "withdrawal_1837",
          document_version: "2026-01",
          granted_at: "2026-07-22T12:00:00Z",
        },
      ],
    })
    expect(response.status).toBe(200)
    expect((item(response).consents as unknown[]).length).toBe(2)
  })

  it("creates a standalone consent for their own order", async () => {
    const [entitledOrder] = createdOrders
    const response = await probeSend(
      "POST",
      "/items/order_consent",
      {
        order: entitledOrder,
        document: "gdpr",
        document_version: "2026-01",
        granted_at: "2026-07-22T12:00:00Z",
      },
      ENTITLED,
    )
    expect(response.status).toBe(200)
  })

  it("denies creating a consent for a foreign order", async () => {
    const [entitledOrder] = createdOrders
    const response = await probeSend(
      "POST",
      "/items/order_consent",
      {
        order: entitledOrder,
        document: "gdpr",
        document_version: "2026-01",
        granted_at: "2026-07-22T12:00:00Z",
      },
      UNENTITLED,
    )
    expect(response.status).toBe(403)
  })

  it("reads own consents only", async () => {
    const own = await probe("/items/order_consent?fields=id,order&limit=-1", ENTITLED)
    expect(own.status).toBe(200)
    expect(items(own).length).toBeGreaterThan(0)
    const foreign = await probe("/items/order_consent?limit=-1", UNENTITLED)
    expect(foreign.status).toBe(200)
    expect(items(foreign)).toHaveLength(0)
  })
})

describe("student entitlements", () => {
  it("reads own entitlements only", async () => {
    const own = await probe("/items/entitlement?fields=id,student,course&limit=-1", ENTITLED)
    expect(own.status).toBe(200)
    expect(items(own)).toHaveLength(1)
    expect(items(own)[0].student).toBe(ENTITLED_ID)
    expect(items(own)[0].course).toBe(PUBLISHED_COURSE_ID)
    const foreign = await probe("/items/entitlement?limit=-1", UNENTITLED)
    expect(foreign.status).toBe(200)
    expect(items(foreign)).toHaveLength(0)
  })

  it("denies creating an entitlement", async () => {
    const response = await probeSend(
      "POST",
      "/items/entitlement",
      { student: UNENTITLED_ID, course: PUBLISHED_COURSE_ID },
      UNENTITLED,
    )
    expect(response.status).toBe(403)
  })

  it("denies updating an entitlement", async () => {
    const own = await probe("/items/entitlement?fields=id&limit=-1", ENTITLED)
    const response = await probeSend(
      "PATCH",
      `/items/entitlement/${items(own)[0].id as number}`,
      { granted_at: "2030-01-01T00:00:00Z" },
      ENTITLED,
    )
    expect(response.status).toBe(403)
  })

  it("denies deleting an entitlement", async () => {
    const own = await probe("/items/entitlement?fields=id&limit=-1", ENTITLED)
    const response = await probeSend(
      "DELETE",
      `/items/entitlement/${items(own)[0].id as number}`,
      undefined,
      ENTITLED,
    )
    expect(response.status).toBe(403)
  })
})

describe("entitlement-gated lesson content", () => {
  it("serves full lesson fields to the entitled student", async () => {
    const response = await probe(
      "/items/lesson?fields=id,type,body,video_uid&limit=-1&sort=id",
      ENTITLED,
    )
    const lessons = nonEmptyItems(response)
    for (const lesson of lessons) {
      expect(lesson.body).toEqual(expect.any(String))
    }
    const video = lessons.find((lesson) => lesson.type === "video")
    expect(video?.video_uid).toEqual(expect.any(String))
  })

  it("expands Materials for the entitled student", async () => {
    const response = await probe(
      "/items/lesson?fields=id,materials.directus_files_id&filter[type][_eq]=video",
      ENTITLED,
    )
    expect(response.status).toBe(200)
    const [video] = items(response)
    const materials = video.materials as { directus_files_id: string }[]
    expect(materials.map((m) => m.directus_files_id)).toContain(MATERIAL_FILE_ID)
  })

  it("nulls paid lesson fields for the non-entitled student", async () => {
    // Directus 11 case/when permissions: the field is in the granted union
    // (via the entitlement-scoped rule), so the response is 200 — but for
    // rows outside that rule the values are nulled, never leaked.
    const response = await probe(
      "/items/lesson?fields=id,body,video_uid,materials&limit=-1",
      UNENTITLED,
    )
    const lessons = nonEmptyItems(response)
    for (const lesson of lessons) {
      expect(lesson.body).toBeNull()
      expect(lesson.video_uid).toBeNull()
      expect(lesson.materials ?? null).toBeNull()
    }
  })

  it("keeps the outline visible to both students, without draft courses", async () => {
    for (const token of [ENTITLED, UNENTITLED]) {
      const response = await probe(
        "/items/lesson?fields=id,title,type,section.course.slug&limit=-1",
        token,
      )
      const lessons = nonEmptyItems(response)
      for (const lesson of lessons) {
        expect((lesson.section as { course: { slug: string } }).course.slug).not.toBe(DRAFT_SLUG)
      }
    }
  })

  it("keeps course visibility identical to public (published only, no config fields)", async () => {
    const list = await probe("/items/course?fields=id,status&limit=-1", UNENTITLED)
    expect(list.status).toBe(200)
    for (const course of items(list)) {
      expect(course.status).toBe("published")
    }
    const config = await probe("/items/course?fields=test_pass_threshold", UNENTITLED)
    expect(config.status).toBe(403)
  })

  it("gates Material file metadata by entitlement", async () => {
    const entitled = await probe(`/files/${MATERIAL_FILE_ID}?fields=id,filename_download`, ENTITLED)
    expect(entitled.status).toBe(200)
    const unentitled = await probe(`/files/${MATERIAL_FILE_ID}`, UNENTITLED)
    expect(unentitled.status).toBe(403)
  })

  it("gates Material file download by entitlement", async () => {
    expect(await probeStatus(`/assets/${MATERIAL_FILE_ID}`, ENTITLED)).toBe(200)
    expect(await probeStatus(`/assets/${MATERIAL_FILE_ID}`, UNENTITLED)).toBe(403)
    expect(await probeStatus(`/assets/${MATERIAL_FILE_ID}`)).toBe(403)
  })
})

describe("database uniqueness constraints (via admin token)", () => {
  it("rejects a duplicate gopay_payment_id", async () => {
    const gopayId = `PROBE-${Date.now()}`
    const first = await probeSend(
      "POST",
      "/items/order",
      { course: PUBLISHED_COURSE_ID, price_czk: 1, gopay_payment_id: gopayId },
      ADMIN,
    )
    expect(first.status).toBe(200)
    createdOrders.push(item(first).id as number)
    const second = await probeSend(
      "POST",
      "/items/order",
      { course: PUBLISHED_COURSE_ID, price_czk: 1, gopay_payment_id: gopayId },
      ADMIN,
    )
    expect(second.status).toBe(400)
    expect(errorCode(second)).toBe("RECORD_NOT_UNIQUE")
  })

  it("rejects a duplicate (student, course) entitlement", async () => {
    const response = await probeSend(
      "POST",
      "/items/entitlement",
      { student: ENTITLED_ID, course: PUBLISHED_COURSE_ID, granted_at: "2026-07-22T12:00:00Z" },
      ADMIN,
    )
    expect(response.status).toBe(400)
    expect(errorCode(response)).toBe("RECORD_NOT_UNIQUE")
  })
})
