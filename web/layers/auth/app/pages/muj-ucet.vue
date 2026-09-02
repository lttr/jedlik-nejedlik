<template>
  <PageWrapper>
    <AuthPanel title="Můj účet">
      <p>
        Jste přihlášeni jako <strong>{{ student?.email }}</strong>
      </p>

      <button type="button" class="p-button" :disabled="logOutPending" @click="onLogOut">
        Odhlásit se
      </button>

      <AuthFormError :message="logOutError" />

      <h2 class="p-heading-4">Změna hesla</h2>

      <p v-if="changed" class="success-message" role="status">
        {{ authMessages.passwordChangedHere }}
      </p>

      <form @submit.prevent="onChangePassword">
        <div class="p-form-group">
          <label for="current-password">Současné heslo</label>
          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            name="currentPassword"
            required
            autocomplete="current-password"
          />
        </div>

        <AuthPasswordField id="new-password" v-model="newPassword" label="Nové heslo" />

        <AuthSubmit :pending="changePending">Změnit heslo</AuthSubmit>

        <AuthFormError :message="changeError" />
      </form>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "auth" })

useHead({ title: "Můj účet" })

const { student } = useStudent()
const { logOut, changePassword } = useAuthActions()

// Two forms, two pending/error pairs: a failed password change must not blank
// the logout button or show under it.
const { pending: logOutPending, errorMessage: logOutError, submit: submitLogOut } = useAuthForm()
const {
  pending: changePending,
  errorMessage: changeError,
  succeeded: changed,
  submit: submitChange,
} = useAuthForm()

async function onLogOut() {
  await submitLogOut(async () => {
    await logOut()
    await navigateTo("/")
  })
}

const currentPassword = ref("")
const newPassword = ref("")

async function onChangePassword() {
  await submitChange(
    async () => {
      await changePassword({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      })
      currentPassword.value = ""
      newPassword.value = ""
    },
    // Saves a round-trip; the route enforces it again.
    () => validatePassword(newPassword.value),
  )
}
</script>
