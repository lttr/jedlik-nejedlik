<template>
  <PageWrapper>
    <AuthPanel title="Přihlášení">
      <form class="p-stack" @submit.prevent="onSubmit">
        <div class="p-form-group">
          <label for="login-email">E-mail</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            name="email"
            required
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

        <button type="submit" class="p-button-brand" :disabled="pending">Přihlásit se</button>

        <AuthFormError :message="errorMessage" />
      </form>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "guest" })

useSeoMeta({ title: "Přihlášení | Jedlík-nejedlík" })

const route = useRoute()
const { logIn } = useAuthActions()

const email = ref("")
const password = ref("")
const pending = ref(false)
const errorMessage = ref("")

async function onSubmit() {
  pending.value = true
  errorMessage.value = ""
  try {
    await logIn({ email: email.value, password: password.value })
    await navigateTo(safeRedirectPath(route.query.redirect))
  } catch (error) {
    errorMessage.value = authErrorMessage(error)
  } finally {
    pending.value = false
  }
}
</script>
