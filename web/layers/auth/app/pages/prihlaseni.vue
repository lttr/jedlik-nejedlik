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
definePageMeta({ middleware: "guest" })

// Bare title: `/prihlaseni` is `robots: false`, so there is no point emitting
// og:* for a page that must never be indexed or shared.
useHead({ title: "Přihlášení" })

const route = useRoute()
const { logIn } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

// What just happened elsewhere, said at the moment the Student needs to know
// it: `/overeni-emailu` activated the account, or `/obnova-hesla` set a new
// password. Both send them here, so both announce themselves the same way.
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
    await navigateTo(safeRedirectPath(route.query.redirect))
  })
}
</script>
