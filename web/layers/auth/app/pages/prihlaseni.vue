<template>
  <PageWrapper>
    <AuthPanel title="Přihlášení">
      <p v-if="notice" class="success-message" role="status">{{ notice }}</p>

      <form @submit.prevent="onSubmit">
        <div class="p-form-group">
          <label for="login-email">E-mail</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            name="email"
            required
            autofocus
            autocomplete="email"
          />
        </div>

        <div class="p-form-group">
          <label for="login-password">Heslo</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            name="password"
            required
            autocomplete="current-password"
          />
        </div>

        <AuthSubmit :pending>Přihlásit se</AuthSubmit>

        <AuthFormError :message="errorMessage" />
      </form>

      <div class="p-flow">
        <p class="p-secondary-text-regular">
          <NuxtLink :to="RESET_PASSWORD_PATH">Zapomněli jste heslo?</NuxtLink>
        </p>

        <p class="p-secondary-text-regular">
          Nemáte ještě účet? <NuxtLink to="/registrace">Zaregistrujte se</NuxtLink>.
        </p>
      </div>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { authRedirectTarget } from "#layers/shop/shared/utils/pending-checkout"
import AuthFormError from "../components/auth/FormError.vue"
import AuthPanel from "../components/auth/Panel.vue"
import AuthSubmit from "../components/auth/Submit.vue"
import { useAuthActions } from "../composables/auth"
import { useAuthForm } from "../composables/auth-form"
import { authMessages } from "#layers/auth/shared/utils/auth-messages"
import {
  EMAIL_VERIFIED_QUERY,
  PASSWORD_CHANGED_QUERY,
  RESET_PASSWORD_PATH,
} from "#layers/auth/shared/utils/redirects"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"
import { takePendingCheckoutSlug } from "#layers/shop/app/utils/pending-checkout"

definePageMeta({ middleware: "guest" })

useHead({ title: "Přihlášení" })

const route = useRoute()
const { logIn } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

const notice = computed(() => {
  if (route.query[EMAIL_VERIFIED_QUERY] !== undefined) {
    return authMessages.emailVerified
  }
  if (route.query[PASSWORD_CHANGED_QUERY] !== undefined) {
    return authMessages.passwordChanged
  }
  return ""
})

const email = ref("")
const password = ref("")

async function onSubmit() {
  await submit(async () => {
    await logIn({ email: email.value, password: password.value })
    // The verification link brings a Student back without `?redirect=`, so the
    // pending-checkout cookie is the fallback and reading it here clears it. An
    // explicit `?redirect=` wins and leaves the cookie alone.
    const rawRedirect = route.query.redirect
    const hasRedirect = typeof rawRedirect === "string" && rawRedirect !== ""
    await navigateTo(
      authRedirectTarget(rawRedirect, hasRedirect ? null : await takePendingCheckoutSlug()),
    )
  })
}
</script>
