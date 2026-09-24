import { describe, expect, it } from "vitest"

import type { Order } from "#layers/directus/shared/utils/schemas"
import {
  BILLING_FIELDS,
  TERMS_VERSION,
  checkoutConsents,
  emptyBillingDetails,
  hasBillingCompanyDetails,
  readRefusal,
  reusableOrder,
  toBillingDetails,
  toBillingPayload,
} from "#layers/shop/shared/utils/checkout"

function order(overrides: Partial<Order>): Order {
  return { id: 1, student: "s", course: 1, status: "created", price_czk: 1490, ...overrides }
}

describe("billing details", () => {
  it("starts with every field empty", () => {
    expect(emptyBillingDetails()).toEqual({
      billing_name: "",
      billing_company: "",
      billing_ic: "",
      billing_street: "",
      billing_city: "",
      billing_zip: "",
    })
  })

  it("reads a Directus row, turning null and missing columns into empty strings", () => {
    const details = toBillingDetails({ billing_name: "Jana Nováková", billing_company: null })

    expect(details.billing_name).toBe("Jana Nováková")
    expect(details.billing_company).toBe("")
    expect(details.billing_zip).toBe("")
  })

  it("trims what the Student typed", () => {
    expect(toBillingDetails({ billing_name: "  Jana  " }).billing_name).toBe("Jana")
  })

  it("ignores a value of the wrong type", () => {
    expect(toBillingDetails({ billing_ic: 12_345_678 }).billing_ic).toBe("")
  })

  it("writes an empty field back as null, so a cleared field reads like an unset one", () => {
    const payload = toBillingPayload({ ...emptyBillingDetails(), billing_name: "Jana" })

    expect(payload.billing_name).toBe("Jana")
    expect(payload.billing_company).toBeNull()
    expect(Object.keys(payload)).toEqual([...BILLING_FIELDS])
  })

  it("knows whether the company block holds anything", () => {
    expect(hasBillingCompanyDetails(emptyBillingDetails())).toBe(false)
    // The name alone is not part of that block, so it must not open it.
    expect(hasBillingCompanyDetails({ ...emptyBillingDetails(), billing_name: "Jana" })).toBe(false)
    expect(hasBillingCompanyDetails({ ...emptyBillingDetails(), billing_ic: "12345678" })).toBe(
      true,
    )
  })
})

describe("consents", () => {
  it("records the terms at their effective version, and nothing else", () => {
    expect(checkoutConsents()).toEqual([{ document: "terms", document_version: TERMS_VERSION }])
  })
})

describe("refusals", () => {
  const conflict = {
    statusCode: 409,
    message: '[GET] "/api/checkout/kurz": 409 already_entitled',
    data: { statusCode: 409, statusMessage: "already_entitled", message: "Tenhle kurz už máte." },
  }

  it("reads the route's code and its Czech sentence, not ofetch's technical one", () => {
    expect(readRefusal(conflict, 409)).toEqual({
      code: "already_entitled",
      message: "Tenhle kurz už máte.",
    })
  })

  it("ignores a status the page did not ask for", () => {
    expect(readRefusal(conflict, 404)).toBeUndefined()
  })

  it("ignores the absence of an error", () => {
    expect(readRefusal(undefined, 409)).toBeUndefined()
  })

  it("ignores a failure that carries nothing to show", () => {
    expect(readRefusal({ statusCode: 409, data: { statusCode: 409 } }, 409)).toBeUndefined()
    expect(readRefusal({ statusCode: 500 }, 500)).toBeUndefined()
  })
})

describe("order reuse", () => {
  it("offers nothing when the Student has no orders for this course", () => {
    expect(reusableOrder([])).toBeUndefined()
  })

  it("ignores an order that never reached the gateway", () => {
    expect(reusableOrder([order({ id: 7 })])).toBeUndefined()
  })

  it("ignores an order that is already settled", () => {
    const settled = [
      order({ id: 7, status: "paid", gopay_payment_id: "1" }),
      order({ id: 8, status: "cancelled", gopay_payment_id: "2" }),
    ]

    expect(reusableOrder(settled)).toBeUndefined()
  })

  it("offers the newest created order that has a payment", () => {
    const orders = [
      order({ id: 7, gopay_payment_id: "older" }),
      order({ id: 9, gopay_payment_id: "newest" }),
      order({ id: 8, gopay_payment_id: "middle" }),
    ]

    expect(reusableOrder(orders)?.gopay_payment_id).toBe("newest")
  })
})
