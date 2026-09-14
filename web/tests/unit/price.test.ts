import { describe, expect, it } from "vitest"

import { formatPriceCzk } from "../../layers/shop/shared/utils/price"

const NBSP = " "

describe("formatPriceCzk", () => {
  it("separates thousands with a non-breaking space", () => {
    expect(formatPriceCzk(1490)).toBe(`1${NBSP}490${NBSP}Kč`)
  })

  it("groups every three digits", () => {
    expect(formatPriceCzk(1_234_567)).toBe(`1${NBSP}234${NBSP}567${NBSP}Kč`)
  })

  it("leaves a price under a thousand ungrouped", () => {
    expect(formatPriceCzk(990)).toBe(`990${NBSP}Kč`)
  })

  it("puts a non-breaking space, never a plain one, before the unit", () => {
    expect(formatPriceCzk(0)).toBe(`0${NBSP}Kč`)
    expect(formatPriceCzk(1490)).not.toContain(" ")
  })
})
