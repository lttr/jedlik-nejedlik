import { describe, expect, it } from "vitest"

import {
  GOPAY_CALLBACK_URL_MAX_LENGTH,
  isPaymentLive,
  orderStatusForPaymentState,
  toHalere,
} from "#layers/shop/shared/utils/gopay"

describe("toHalere", () => {
  it("converts whole koruny to haléře", () => {
    expect(toHalere(1490)).toBe(149_000)
  })

  it("converts a zero price", () => {
    expect(toHalere(0)).toBe(0)
  })

  it("refuses a price that is not whole koruny", () => {
    expect(() => toHalere(1490.5)).toThrow(/whole koruny/)
  })

  it("refuses a negative price", () => {
    expect(() => toHalere(-1)).toThrow(/whole koruny/)
  })

  it("refuses a price that is not a number at all", () => {
    expect(() => toHalere(Number.NaN)).toThrow(/whole koruny/)
  })
})

describe("orderStatusForPaymentState", () => {
  it("marks a paid Payment paid", () => {
    expect(orderStatusForPaymentState("PAID")).toBe("paid")
  })

  it("marks a canceled Payment cancelled", () => {
    expect(orderStatusForPaymentState("CANCELED")).toBe("cancelled")
  })

  it("marks a timed-out Payment cancelled", () => {
    expect(orderStatusForPaymentState("TIMEOUTED")).toBe("cancelled")
  })

  it("leaves a Payment still in flight alone", () => {
    expect(orderStatusForPaymentState("CREATED")).toBeUndefined()
    expect(orderStatusForPaymentState("PAYMENT_METHOD_CHOSEN")).toBeUndefined()
    expect(orderStatusForPaymentState("AUTHORIZED")).toBeUndefined()
  })

  it("leaves a refunded Payment alone, because a paid Order is final in this area", () => {
    expect(orderStatusForPaymentState("REFUNDED")).toBeUndefined()
    expect(orderStatusForPaymentState("PARTIALLY_REFUNDED")).toBeUndefined()
  })
})

describe("isPaymentLive", () => {
  it("is true while the Student can still pay this Payment", () => {
    expect(isPaymentLive("CREATED")).toBe(true)
    expect(isPaymentLive("PAYMENT_METHOD_CHOSEN")).toBe(true)
  })

  it("is false once the Payment is settled one way or another", () => {
    expect(isPaymentLive("PAID")).toBe(false)
    expect(isPaymentLive("CANCELED")).toBe(false)
    expect(isPaymentLive("TIMEOUTED")).toBe(false)
    expect(isPaymentLive("AUTHORIZED")).toBe(false)
  })
})

describe("GOPAY_CALLBACK_URL_MAX_LENGTH", () => {
  it("is GoPay's documented cap", () => {
    expect(GOPAY_CALLBACK_URL_MAX_LENGTH).toBe(512)
  })
})
