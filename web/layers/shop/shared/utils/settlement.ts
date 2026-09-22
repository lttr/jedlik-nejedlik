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

// What the return route answers and the return page renders: the outcome, and
// the Course it is about — its title to name it, its slug for „Zkusit znovu".
//
// Both are empty when the Course stopped being readable between the Order and
// the return (unpublished, archived). The Course is only how the page words
// the outcome, so that costs the wording, never the outcome: the page drops
// the title and the „Zkusit znovu" link and says the rest anyway.
export interface SettlementView {
  state: SettlementState
  courseTitle: string
  courseSlug: string
}
