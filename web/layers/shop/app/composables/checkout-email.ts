import { useStorage } from "@vueuse/core"
import type { RemovableRef } from "@vueuse/core"

// The e-mail typed in step 1, kept so the tab the verification link opens can
// pre-fill it (ADR 0005). `initOnMounted` and `flush: "sync"` are both
// load-bearing. See docs/shop.md, „Pending checkout".
export function useRememberedCheckoutEmail(): RemovableRef<string> {
  return useStorage("checkout-email", "", undefined, { initOnMounted: true, flush: "sync" })
}
