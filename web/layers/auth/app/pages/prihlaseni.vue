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

        <button type="submit" class="p-button-brand" :disabled="pending">Přihlásit se</button>

        <AuthFormError :message="errorMessage" />
      </form>
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

const email = ref("")
const password = ref("")

async function onSubmit() {
  await submit(async () => {
    await logIn({ email: email.value, password: password.value })
    await navigateTo(safeRedirectPath(route.query.redirect))
  })
}
</script>
