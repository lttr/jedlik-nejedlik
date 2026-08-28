export interface AuthForm {
  pending: Ref<boolean>
  errorMessage: Ref<string>
  // The route's own name for the last failure (`invalid_token`, `rate_limited`,
  // …), for a form that has to react to which failure it was rather than only
  // show it. Empty whenever `errorMessage` is.
  errorCode: Ref<string>
  // `validate` returns a Czech complaint, or null when the form may be sent.
  submit: (action: () => Promise<void>, validate?: () => string | null) => Promise<void>
}

// The shape every auth form shares: check what can be checked here, disable
// while in flight, clear the last error, run the action, show whatever Czech
// message came back. The optional pre-check is what keeps the password rule
// from being retyped on every form that sets one.
export function useAuthForm(): AuthForm {
  const pending = ref(false)
  const errorMessage = ref("")
  const errorCode = ref("")

  async function submit(
    action: () => Promise<void>,
    validate?: () => string | null,
  ): Promise<void> {
    const complaint = validate?.() ?? null
    if (complaint !== null) {
      errorMessage.value = complaint
      // The browser caught this one, so there is no route code to report.
      errorCode.value = ""
      return
    }

    pending.value = true
    errorMessage.value = ""
    errorCode.value = ""
    try {
      await action()
    } catch (error) {
      const failure = authFailure(error)
      errorMessage.value = failure.message
      errorCode.value = failure.code
    } finally {
      pending.value = false
    }
  }

  return { pending, errorMessage, errorCode, submit }
}
