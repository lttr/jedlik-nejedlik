<template>
  <PageWrapper root-element="article" class="p-prose auth-page">
    <h1>Přihlášení</h1>

    <p v-if="verified" class="success-message">Váš e-mail byl ověřen. Nyní se můžete přihlásit.</p>
    <p v-if="reset" class="success-message">Heslo bylo změněno. Přihlaste se novým heslem.</p>

    <form class="auth-form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="login-email">E-mail</label>
        <input id="login-email" v-model="email" type="email" required autocomplete="email" />
      </div>

      <div class="p-form-group">
        <label for="login-password">Heslo</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>

      <div class="p-center">
        <button type="submit" class="p-button-brand" :disabled="pending">Přihlásit se</button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>

    <p class="auth-links">
      <NuxtLink to="/zapomenute-heslo">Zapomněli jste heslo?</NuxtLink>
    </p>
    <p class="auth-links">Nemáte účet? <NuxtLink to="/registrace">Zaregistrujte se</NuxtLink></p>
  </PageWrapper>
</template>

<script setup lang="ts">
const route = useRoute()
const { login } = useAuth()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const password = ref("")

const verified = computed(() => route.query.verified === "1")
const reset = computed(() => route.query.reset === "1")

async function onSubmit() {
  const ok = await submit(
    () => login({ email: email.value, password: password.value }),
    "Přihlášení se nezdařilo.",
  )
  if (!ok) return
  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/ucet"
  await navigateTo(redirect)
}

useSeoMeta({ title: "Přihlášení", robots: "noindex, nofollow" })
</script>

<style scoped>
.auth-form {
  max-width: 40ch;
  margin-inline: auto;
  margin-top: var(--space-5);
}

.auth-links {
  text-align: center;
}
</style>
