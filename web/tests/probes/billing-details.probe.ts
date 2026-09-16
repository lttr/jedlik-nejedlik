import { afterAll, beforeAll, describe, expect, it } from "vitest"
import {
  ENTITLED_ID,
  PUBLISHED_COURSE_ID,
  UNENTITLED_ID,
  errorCode,
  item,
  probe,
  probeSend,
  roleToken,
} from "./support"

// Billing Details on the Account and their snapshot on the Order: what a
// Student may read and write about themselves, and that neither reaches
// another Student's row. Relies on the two [TEST] Student fixtures.
// See .aiwork/2026-09-15_checkout-gopay/implementation-notes.md.
//
// Required environment (static tokens of the fixture users, never committed):
//   DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN    probe-student-entitled@jedlik-nejedlik.cz
//   DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN  probe-student-unentitled@jedlik-nejedlik.cz
//   DIRECTUS_PROBE_ADMIN_TOKEN               admin token (readback + cleanup)

const ENTITLED = roleToken("DIRECTUS_PROBE_STUDENT_ENTITLED_TOKEN")
const UNENTITLED = roleToken("DIRECTUS_PROBE_STUDENT_UNENTITLED_TOKEN")
const ADMIN = roleToken("DIRECTUS_PROBE_ADMIN_TOKEN")

const BILLING_FIELDS = [
  "billing_name",
  "billing_company",
  "billing_ic",
  "billing_street",
  "billing_city",
  "billing_zip",
] as const

// A full set of Billing Details, marked so a leftover row is recognisable.
const BILLING = {
  billing_name: "[TEST] Jana Nováková",
  billing_company: "[TEST] Firma s.r.o.",
  billing_ic: "12345678",
  billing_street: "Testovací 1",
  billing_city: "Praha",
  billing_zip: "11000",
}

const EMPTY_BILLING = Object.fromEntries(BILLING_FIELDS.map((field) => [field, null]))

// Orders created during the run; deleted in afterAll.
const createdOrders: number[] = []

beforeAll(async () => {
  // Seeded with the admin token so the denial probes below stand on their own,
  // whatever the Student is allowed to write.
  const response = await probeSend("PATCH", `/users/${ENTITLED_ID}`, BILLING, ADMIN)
  if (response.status !== 200) {
    throw new Error(`Probe fixture setup failed: PATCH /users returned ${response.status}`)
  }
})

afterAll(async () => {
  for (const userId of [ENTITLED_ID, UNENTITLED_ID]) {
    const response = await probeSend("PATCH", `/users/${userId}`, EMPTY_BILLING, ADMIN)
    if (response.status !== 200) {
      throw new Error(`Probe cleanup failed: PATCH /users/${userId} returned ${response.status}`)
    }
  }
  if (createdOrders.length > 0) {
    const response = await probeSend("DELETE", "/items/order", createdOrders, ADMIN)
    if (response.status !== 204) {
      throw new Error(`Probe cleanup failed: DELETE /items/order returned ${response.status}`)
    }
  }
})

describe("student billing details on the account", () => {
  // The Student policy's `read` rule on `directus_users` (own row, limited to
  // id, e-mail and the billing fields) is not on the instance yet, so there is
  // nothing to assert about reading Billing Details back, and a `PATCH
  // /users/me` still answers 403: Directus reads the updated row back through
  // the read rules. Both assertions belong here once the rule exists.
  // See .aiwork/2026-09-15_checkout-gopay/tickets/01_billing-details-service-account.md.

  it("denies reading another student's row", async () => {
    const response = await probe(`/users/${ENTITLED_ID}`, UNENTITLED)
    expect(response.status).toBe(403)
  })

  it("denies writing another student's billing details", async () => {
    const response = await probeSend(
      "PATCH",
      `/users/${ENTITLED_ID}`,
      { billing_name: "[TEST] spoofed" },
      UNENTITLED,
    )
    expect(response.status).toBe(403)
    const stored = item(await probe(`/users/${ENTITLED_ID}?fields=billing_name`, ADMIN))
    expect(stored.billing_name).toBe(BILLING.billing_name)
  })

  it("denies widening its own row beyond billing details and the password", async () => {
    const response = await probeSend(
      "PATCH",
      "/users/me",
      { email: "spoofed@example.com" },
      ENTITLED,
    )
    expect(response.status).toBe(403)
  })
})

describe("billing snapshot on the order", () => {
  it("creates an order carrying the billing snapshot", async () => {
    const response = await probeSend(
      "POST",
      "/items/order",
      { course: PUBLISHED_COURSE_ID, price_czk: 1990, ...BILLING },
      ENTITLED,
    )
    expect(response.status).toBe(200)
    const orderId = item(response).id as number
    createdOrders.push(orderId)
    const stored = item(
      await probe(`/items/order/${orderId}?fields=${BILLING_FIELDS.join(",")}`, ADMIN),
    )
    expect(stored).toEqual(BILLING)
  })

  it("denies an order whose snapshot belongs to another student's order", async () => {
    // The snapshot travels with the Order, so the Order's own scoping is what
    // protects it: a foreign order stays unreadable, billing fields included.
    const [orderId] = createdOrders
    const response = await probe(`/items/order/${orderId}?fields=billing_name`, UNENTITLED)
    expect(response.status).toBe(403)
    expect(errorCode(response)).toBe("FORBIDDEN")
  })
})
