import { afterAll, beforeAll, describe, expect, it } from "vitest"
import {
  ENTITLED_ID,
  PUBLISHED_COURSE_ID,
  PUBLISHED_SLUG,
  cleanUpItems,
  errorCode,
  generatePassword,
  item,
  items,
  nonEmptyItems,
  probe,
  probeSend,
  roleIdByName,
  roleToken,
  throwawayEmail,
} from "./support"

// The Shop Service Account's permission matrix (ADR 0006): the three writes
// the payment flow needs, and the refusals that keep a leaked token from
// administering the CMS. Fixtures (a throwaway Student and their Order) are
// created and deleted with the admin token.
// See .aiwork/2026-09-15_checkout-gopay/implementation-notes.md.
//
// Required environment (never committed):
//   DIRECTUS_PROBE_SHOP_TOKEN    static token of the „Shop service" user
//   DIRECTUS_PROBE_ADMIN_TOKEN   admin token (fixture creation + cleanup)

const SHOP = process.env.DIRECTUS_PROBE_SHOP_TOKEN ?? ""
const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")

const createdUsers: string[] = []
const createdOrders: number[] = []
const createdEntitlements: number[] = []

let studentId: string
let orderId: number
// A second Student with an Order of their own, so "reads any order" can be
// proved rather than inferred from whatever the instance happens to hold.
let otherStudentId: string
let otherOrderId: number

// Which Student an Order in a read belongs to, or undefined if the read did
// not return it at all.
function studentOfOrder(rows: Record<string, unknown>[], order: number): unknown {
  return rows.find((row) => row.id === order)?.student
}

// Runs only where the „Shop service" token is in the environment
// (DIRECTUS_PROBE_SHOP_TOKEN in web/.env); the account itself is on the
// instance and in the committed dump.
// See .aiwork/2026-09-15_checkout-gopay/tickets/01_billing-details-service-account.md.
describe.skipIf(SHOP === "")("shop service account", () => {
  // A throwaway Student and an Order of theirs, created with the admin token.
  async function seedStudentWithOrder(
    studentRole: string,
  ): Promise<{ student: string; order: number }> {
    const user = await probeSend(
      "POST",
      "/users",
      {
        email: throwawayEmail("shop"),
        password: generatePassword(),
        role: studentRole,
        status: "active",
        provider: "default",
      },
      ADMIN,
    )
    if (user.status !== 200) {
      throw new Error(`Probe fixture setup failed: POST /users returned ${user.status}`)
    }
    const student = item(user).id as string
    createdUsers.push(student)

    const created = await probeSend(
      "POST",
      "/items/order",
      { student, course: PUBLISHED_COURSE_ID, price_czk: 1990 },
      ADMIN,
    )
    if (created.status !== 200) {
      throw new Error(`Probe fixture setup failed: POST /items/order returned ${created.status}`)
    }
    const order = item(created).id as number
    createdOrders.push(order)
    return { student, order }
  }

  beforeAll(async () => {
    const studentRole = await roleIdByName("Student", ADMIN)
    ;({ student: studentId, order: orderId } = await seedStudentWithOrder(studentRole))
    ;({ student: otherStudentId, order: otherOrderId } = await seedStudentWithOrder(studentRole))
  })

  afterAll(async () => {
    await cleanUpItems("/items/entitlement", createdEntitlements, ADMIN)
    await cleanUpItems("/items/order", createdOrders, ADMIN)
    await cleanUpItems("/users", createdUsers, ADMIN)
  })

  describe("the writes the payment flow needs", () => {
    it("reads any order, not only one student's", async () => {
      // Two Orders from two different Students: a row-filtered read would
      // return at most one of them, whoever the token belongs to.
      const response = await probe("/items/order?fields=id,student,status&limit=-1", SHOP)
      const orders = nonEmptyItems(response)
      expect(studentOfOrder(orders, orderId)).toBe(studentId)
      expect(studentOfOrder(orders, otherOrderId)).toBe(otherStudentId)
    })

    it("stamps the Payment id on an order", async () => {
      const paymentId = `PROBE-${Date.now()}`
      const response = await probeSend(
        "PATCH",
        `/items/order/${orderId}`,
        { gopay_payment_id: paymentId },
        SHOP,
      )
      expect(response.status).toBe(200)
      expect(item(response).gopay_payment_id).toBe(paymentId)
    })

    it("settles an order", async () => {
      const response = await probeSend("PATCH", `/items/order/${orderId}`, { status: "paid" }, SHOP)
      expect(response.status).toBe(200)
      expect(item(response).status).toBe("paid")
    })

    it("records the invoice id on an order", async () => {
      const response = await probeSend(
        "PATCH",
        `/items/order/${orderId}`,
        { fakturoid_invoice_id: "PROBE-INVOICE" },
        SHOP,
      )
      expect(response.status).toBe(200)
    })

    it("grants an entitlement and reads it back", async () => {
      const created = await probeSend(
        "POST",
        "/items/entitlement",
        { student: studentId, course: PUBLISHED_COURSE_ID, order: orderId },
        SHOP,
      )
      expect(created.status).toBe(200)
      createdEntitlements.push(item(created).id as number)
      const read = await probe(
        `/items/entitlement?fields=id,student,course&filter[student][_eq]=${studentId}`,
        SHOP,
      )
      expect(items(read)).toHaveLength(1)
    })

    it("reads the course fields the Payment is built from", async () => {
      const response = await probe(
        `/items/course?fields=id,slug,price_czk,status&filter[slug][_eq]=${PUBLISHED_SLUG}`,
        SHOP,
      )
      const [course] = nonEmptyItems(response)
      expect(course.id).toBe(PUBLISHED_COURSE_ID)
      expect(course.price_czk).toEqual(expect.any(Number))
    })

    it("reads the payer's e-mail", async () => {
      const response = await probe(`/users/${studentId}?fields=id,email`, SHOP)
      expect(response.status).toBe(200)
      expect(item(response).email).toEqual(expect.any(String))
    })
  })

  describe("everything else is refused", () => {
    it("denies creating an order", async () => {
      const response = await probeSend(
        "POST",
        "/items/order",
        { student: studentId, course: PUBLISHED_COURSE_ID, price_czk: 1 },
        SHOP,
      )
      expect(response.status).toBe(403)
    })

    it("denies changing an order's price or owner", async () => {
      const price = await probeSend("PATCH", `/items/order/${orderId}`, { price_czk: 1 }, SHOP)
      expect(price.status).toBe(403)
      const owner = await probeSend(
        "PATCH",
        `/items/order/${orderId}`,
        { student: ENTITLED_ID },
        SHOP,
      )
      expect(owner.status).toBe(403)
    })

    it("denies updating a course", async () => {
      const response = await probeSend(
        "PATCH",
        `/items/course/${PUBLISHED_COURSE_ID}`,
        { price_czk: 1 },
        SHOP,
      )
      expect(response.status).toBe(403)
    })

    it("denies reading course fields outside the payment flow's list", async () => {
      const response = await probe("/items/course?fields=test_pass_threshold", SHOP)
      expect(response.status).toBe(403)
    })

    it("denies updating a user", async () => {
      const response = await probeSend(
        "PATCH",
        `/users/${studentId}`,
        { billing_name: "[TEST] spoofed" },
        SHOP,
      )
      expect(response.status).toBe(403)
    })

    it("denies deleting an entitlement", async () => {
      const [entitlementId] = createdEntitlements
      const response = await probeSend(
        "DELETE",
        `/items/entitlement/${entitlementId}`,
        undefined,
        SHOP,
      )
      expect(response.status).toBe(403)
    })

    it("denies a second entitlement for the same student and course", async () => {
      const response = await probeSend(
        "POST",
        "/items/entitlement",
        { student: studentId, course: PUBLISHED_COURSE_ID },
        SHOP,
      )
      expect(response.status).toBe(400)
      expect(errorCode(response)).toBe("RECORD_NOT_UNIQUE")
    })
  })
})
