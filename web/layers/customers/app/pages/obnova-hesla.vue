<template>
  <PageWrapper root-element="article" class="p-prose auth-page">
    <h1>Obnova hesla</h1>

    <p v-if="!token" class="error-message">
      Odkaz pro obnovu hesla je neplatný. Vyžádejte si prosím
      <NuxtLink to="/zapomenute-heslo">nový odkaz</NuxtLink>.
    </p>

    <form v-else class="auth-form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="reset-password">Nové heslo (alespoň 8 znaků)</label>
        <input
          id="reset-password"
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
        />
      </div>

      <div class="p-center">
        <button type="submit" class="p-button-brand" :disabled="pending">Nastavit heslo</button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </PageWrapper>
</template>

<script setup lang="ts">
const route = useRoute()
const { resetPassword } = useAuth()
const { pending, errorMessage, submit } = useAuthForm()

const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""))
const password = ref("")

async function onSubmit() {
  if (!token.value) return
  const ok = await submit(
    () => resetPassword({ token: token.value, password: password.value }),
    "Heslo se nepodařilo změnit.",
  )
  if (ok) await navigateTo("/prihlaseni?reset=1")
}

useSeoMeta({ title: "Obnova hesla", robots: "noindex, nofollow" })
</script>

<style scoped>
.auth-form {
  max-width: 40ch;
  margin-inline: auto;
  margin-top: var(--space-5);
}
</style>
