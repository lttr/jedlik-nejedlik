import { useStorage } from "@vueuse/core"
import type { RemovableRef } from "@vueuse/core"

// The e-mail typed in step 1 of a Checkout, kept so that the other tab, the
// one the verification link opens, can pre-fill it (ADR 0005). The password is
// never kept anywhere.
//
// `initOnMounted` keeps the server render and the first client render equal,
// which a value only the browser has would otherwise break.
//
// `flush: "sync"` is load-bearing: both writers set this and are then
// unmounted by the very state change that follows (the step swaps its panel),
// so a queued write would be dropped along with the watcher that owns it.
export function useRememberedCheckoutEmail(): RemovableRef<string> {
  return useStorage("checkout-email", "", undefined, { initOnMounted: true, flush: "sync" })
}
