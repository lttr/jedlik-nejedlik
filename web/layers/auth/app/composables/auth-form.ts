export interface AuthForm {
  pending: Ref<boolean>
  errorMessage: Ref<string>
  // The route's own code for the last failure (`invalid_token`, …), for a form
  // that has to react to which failure it was. Empty whenever `errorMessage` is.
  errorCode: Ref<string>
  // Reset as soon as the next attempt starts, so a success banner can never
  // sit next to a fresh error.
  succeeded: Ref<boolean>
  // `validate` returns a Czech complaint, or null when the form may be sent.
  submit: (action: () => Promise<void>, validate?: () => string | null) => Promise<void>
}

// The optional pre-check keeps the password rule from being retyped on every
// form that sets one.
export function useAuthForm(): AuthForm {
  const pending = ref(false)
  const errorMessage = ref("")
  const errorCode = ref("")
  const succeeded = ref(false)

  async function submit(
    action: () => Promise<void>,
    validate?: () => string | null,
  ): Promise<void> {
    succeeded.value = false

    const complaint = validate?.() ?? null
    if (complaint !== null) {
      errorMessage.value = complaint
      errorCode.value = ""
      return
    }

    pending.value = true
    errorMessage.value = ""
    errorCode.value = ""
    try {
      await action()
      succeeded.value = true
    } catch (error) {
      const failure = authFailure(error)
      errorMessage.value = failure.message
      errorCode.value = failure.code
    } finally {
      pending.value = false
    }
  }

  return { pending, errorMessage, errorCode, succeeded, submit }
}
