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

      <!-- Shop-layer sections. Each reads its own data and shows its own error,
           so a slow Directus costs one section and not the whole page. -->
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
import { emptyBillingDetails } from "#layers/shop/shared/utils/checkout"
import AuthFormError from "../components/auth/FormError.vue"
import AuthPanel from "../components/auth/Panel.vue"
import AuthPasswordField from "../components/auth/PasswordField.vue"
import AuthSubmit from "../components/auth/Submit.vue"
import { useAccount } from "../composables/account"
import { useAuthActions } from "../composables/auth"
import { useAuthForm } from "../composables/auth-form"
import { authMessages } from "#layers/auth/shared/utils/auth-messages"
import { validatePassword } from "#layers/auth/shared/utils/password"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"
import AccountBilling from "#layers/shop/app/components/account/Billing.vue"
import AccountMyCourses from "#layers/shop/app/components/account/MyCourses.vue"

definePageMeta({ middleware: "auth" })

// Vue renders siblings in order, so `<AccountBilling>` would wait a whole
// Directus round-trip for „Moje kurzy". Both requests start here instead, under
// the keys and defaults each section's own `useFetch` then resolves from.
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
