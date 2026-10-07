import { describe, expect, it } from "vite-plus/test"

import { settlementStateForOrder } from "#layers/shop/shared/utils/settlement"

describe("settlementStateForOrder", () => {
  it("reports a paid Order as paid", () => {
    expect(settlementStateForOrder("paid")).toBe("paid")
  })

  it("reports a cancelled Order as failed", () => {
    expect(settlementStateForOrder("cancelled")).toBe("failed")
  })

  // The Student can beat GoPay's notification back to the site, so an Order
  // that is still `created` is „not an outcome yet", never a failure.
  it("reports an unsettled Order as pending", () => {
    expect(settlementStateForOrder("created")).toBe("pending")
  })
})
