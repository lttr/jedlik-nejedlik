import { StorageSerializers, useStorage } from "@vueuse/core"
import type { ComputedRef } from "vue"

const STORAGE_KEY = "cookie-consent"

/** Bump to re-ask everyone, e.g. when another vendor is added. */
const CONSENT_VERSION = 1

export type ConsentStatus = "granted" | "denied"

interface ConsentDecision {
  status: ConsentStatus
  decidedAt: string
  version: number
}

interface CookieConsent {
  /** The visitor accepted ad-targeting cookies; gates the Meta Pixel. */
  isGranted: ComputedRef<boolean>
  /** No decision on record for the current version, so the bar asks for one. */
  isBarOpen: ComputedRef<boolean>
  decide: (status: ConsentStatus) => void
  reopen: () => void
}

/**
 * The visitor's cookie decision, kept in `localStorage` only — nothing about it
 * reaches the server. The stored decision is the single source of truth: the
 * bar is open exactly while there is none, and reopening it clears the old one.
 * Instances share state in-tab through VueUse's storage event.
 */
export function useCookieConsent(): CookieConsent {
  const decision = useStorage<ConsentDecision | null>(STORAGE_KEY, null, undefined, {
    serializer: StorageSerializers.object,
  })

  const isDecided = computed(() => decision.value?.version === CONSENT_VERSION)
  const isGranted = computed(() => isDecided.value && decision.value?.status === "granted")
  const isBarOpen = computed(() => !isDecided.value)

  function decide(status: ConsentStatus): void {
    decision.value = { status, decidedAt: new Date().toISOString(), version: CONSENT_VERSION }
  }

  function reopen(): void {
    decision.value = null
  }

  return { isGranted, isBarOpen, decide, reopen }
}
