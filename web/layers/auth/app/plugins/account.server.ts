import type { RequestEventContext } from "nuxt/schema"

import { useAccount } from "../composables/account"

// Moves the Account the `account-session` middleware resolved into state, so
// it reaches the browser in the SSR payload and the client never asks again.
export default defineNuxtPlugin(() => {
  const context: RequestEventContext | undefined = useRequestEvent()?.context
  useAccount().setAccount(context?.account ?? null)
})
