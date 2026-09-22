import type { Order } from "../../../directus/shared/utils/schemas"

// The return page's vocabulary. The Order's status is the whole truth — money
// turns into access in `settlePayment` and nowhere else — so the page only
// translates it into the three things it knows how to say.

// `pending` is „not an outcome yet": the Payment is still live, or GoPay has
// not told us about it yet. It is what the Student sees while the page waits.
export type SettlementState = "paid" | "pending" | "failed"

export function settlementStateForOrder(status: Order["status"]): SettlementState {
  if (status === "paid") {
    return "paid"
  }
  return status === "cancelled" ? "failed" : "pending"
}

// The Course fields are empty when it stopped being readable in the meantime.
// See docs/shop.md, „Settlement".
export interface SettlementView {
  state: SettlementState
  courseTitle: string
  courseSlug: string
}
