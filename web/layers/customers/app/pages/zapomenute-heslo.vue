<template>
  <PageWrapper root-element="article" class="p-prose auth-page">
    <h1>Zapomenuté heslo</h1>

    <p v-if="done" class="success-message">
      Pokud k zadanému e-mailu existuje účet, poslali jsme na něj odkaz pro obnovu hesla.
    </p>

    <form v-else class="auth-form" @submit.prevent="onSubmit">
      <p>Zadejte svůj e-mail a my vám pošleme odkaz pro nastavení nového hesla.</p>

      <div class="p-form-group">
        <label for="forgot-email">E-mail</label>
        <input id="forgot-email" v-model="email" type="email" required autocomplete="email" />
      </div>

      <div class="p-center">
        <button type="submit" class="p-button-brand" :disabled="pending">Poslat odkaz</button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>

    <p class="auth-links"><NuxtLink to="/prihlaseni">Zpět na přihlášení</NuxtLink></p>
  </PageWrapper>
</template>

<script setup lang="ts">
const { requestPasswordReset } = useAuth()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const done = ref(false)

async function onSubmit() {
  done.value = await submit(
    () => requestPasswordReset(email.value),
    "Odeslání se nezdařilo. Zkuste to prosím později.",
  )
}

useSeoMeta({ title: "Zapomenuté heslo", robots: "noindex, nofollow" })
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
