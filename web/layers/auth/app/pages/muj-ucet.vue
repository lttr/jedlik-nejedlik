<template>
  <PageWrapper>
    <AuthPanel title="Můj účet">
      <p>
        Jste přihlášeni jako <strong>{{ account?.email }}</strong>
      </p>

      <button type="button" class="p-button" :disabled="logOutPending" @click="onLogOut">
        Odhlásit se
      </button>

      <AuthFormError :message="logOutError" />

      <!-- Shop-layer sections, on the account page because that page belongs
           to the auth layer. Each reads its own data and shows its own error,
           so a slow Directus costs one section and not the whole page; the
           script below only starts both requests at once. -->
      <AccountMyCourses />

      <AccountBilling />

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
import { emptyBillingDetails } from "../../../shop/shared/utils/checkout"

definePageMeta({ middleware: "auth" })

// Vue renders siblings in order, so `<AccountBilling>` would not even dispatch
// its request until „Moje kurzy" had come back — a whole Directus round-trip of
// added TTFB. Both are started here instead, under the keys and with the
// defaults the two sections use, so each section's own `useFetch` resolves
// from this one.
await Promise.all([
  useFetch("/api/account/courses", { key: "account:courses", default: () => [] }),
  useFetch("/api/account/billing", { key: "account:billing", default: emptyBillingDetails }),
])

useHead({ title: "Můj účet" })

const { account } = useAccount()
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
    () => validatePassword(newPassword.value),
  )
}
</script>
