import { StorageSerializers, useStorage } from "@vueuse/core"
import type { ComputedRef } from "vue"

const STORAGE_KEY = "cookie-consent"

/** Bump to re-ask everyone, e.g. when another vendor is added. */
const CONSENT_VERSION = 1

/** Shared across instances, so the settings button can open the bar in dev. */
const isForcedOpen = ref(false)

export type ConsentStatus = "granted" | "denied"

interface ConsentDecision {
  status: ConsentStatus
  decidedAt: string
  version: number
}

interface CookieConsent {
  /** The visitor accepted optional cookies; gates every consent-only script. */
  isGranted: ComputedRef<boolean>
  /** No decision on record for the current version, so the bar asks for one. */
  isBarOpen: ComputedRef<boolean>
  decide: (status: ConsentStatus) => void
  reopen: () => void
}

/**
 * The visitor's cookie decision. It is kept in `localStorage` and never reaches
 * the server, and it is the only source of truth here: the bar is open exactly
 * while no decision for the current version is stored, and reopening the bar
 * clears the stored one. In dev the bar stays hidden until the settings button
 * asks for it. VueUse's storage event keeps instances of this composable in
 * sync within the tab.
 */
export function useCookieConsent(): CookieConsent {
  const decision = useStorage<ConsentDecision | null>(STORAGE_KEY, null, undefined, {
    serializer: StorageSerializers.object,
  })

  const isDecided = computed(() => decision.value?.version === CONSENT_VERSION)
  const isGranted = computed(() => isDecided.value && decision.value?.status === "granted")
  // `import.meta.dev` is compile-time, so this drops out of the built site.
  const isBarOpen = computed(() => !isDecided.value && (isForcedOpen.value || !import.meta.dev))

  function decide(status: ConsentStatus): void {
    decision.value = { status, decidedAt: new Date().toISOString(), version: CONSENT_VERSION }
    isForcedOpen.value = false
  }

  function reopen(): void {
    decision.value = null
    isForcedOpen.value = true
  }

  return { isGranted, isBarOpen, decide, reopen }
}
