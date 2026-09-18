import { useStorage } from "@vueuse/core"
import type { RemovableRef } from "@vueuse/core"

// The address this browser registered with in step 1 of a Checkout, so the
// *other* tab — the one the verification link opens — can pre-fill it (ADR
// 0005). The browser's half of the trip whose server half is the
// pending-checkout cookie; the password is never kept anywhere.
//
// `initOnMounted` keeps the server render and the first client render equal,
// which a value only the browser has would otherwise break. `flush: "sync"`
// is load-bearing: both writers set this and are unmounted by the very state
// change that follows (the step swaps its panel), and a queued write would be
// dropped with the watcher that owns it.
export function useRememberedCheckoutEmail(): RemovableRef<string> {
  return useStorage("checkout-email", "", undefined, { initOnMounted: true, flush: "sync" })
}
