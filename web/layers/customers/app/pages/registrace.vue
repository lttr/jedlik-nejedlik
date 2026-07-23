<template>
  <PageWrapper root-element="article" class="p-prose auth-page">
    <h1>Registrace</h1>

    <p v-if="done" class="success-message">
      Děkujeme za registraci. Na zadaný e-mail jsme poslali odkaz pro ověření – po jeho potvrzení se
      budete moci přihlásit.
    </p>

    <form v-else class="auth-form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="reg-first-name">Jméno</label>
        <input id="reg-first-name" v-model="firstName" type="text" autocomplete="given-name" />
      </div>

      <div class="p-form-group">
        <label for="reg-last-name">Příjmení</label>
        <input id="reg-last-name" v-model="lastName" type="text" autocomplete="family-name" />
      </div>

      <div class="p-form-group">
        <label for="reg-email">E-mail *</label>
        <input id="reg-email" v-model="email" type="email" required autocomplete="email" />
      </div>

      <div class="p-form-group">
        <label for="reg-password">Heslo * (alespoň 8 znaků)</label>
        <input
          id="reg-password"
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
        />
      </div>

      <div class="p-center">
        <button type="submit" class="p-button-brand" :disabled="pending">Zaregistrovat se</button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>

    <p class="auth-links">Máte už účet? <NuxtLink to="/prihlaseni">Přihlaste se</NuxtLink></p>
  </PageWrapper>
</template>

<script setup lang="ts">
const { register } = useAuth()
const { pending, errorMessage, submit } = useAuthForm()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const done = ref(false)

async function onSubmit() {
  done.value = await submit(
    () =>
      register({
        email: email.value,
        password: password.value,
        first_name: firstName.value || undefined,
        last_name: lastName.value || undefined,
      }),
    "Registrace se nezdařila.",
  )
}

useSeoMeta({ title: "Registrace", robots: "noindex, nofollow" })
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
