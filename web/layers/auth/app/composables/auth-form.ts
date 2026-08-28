export interface AuthForm {
  pending: Ref<boolean>
  errorMessage: Ref<string>
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

  async function submit(
    action: () => Promise<void>,
    validate?: () => string | null,
  ): Promise<void> {
    const complaint = validate?.() ?? null
    if (complaint !== null) {
      errorMessage.value = complaint
      return
    }

    pending.value = true
    errorMessage.value = ""
    try {
      await action()
    } catch (error) {
      errorMessage.value = authErrorMessage(error)
    } finally {
      pending.value = false
    }
  }

  return { pending, errorMessage, submit }
}
