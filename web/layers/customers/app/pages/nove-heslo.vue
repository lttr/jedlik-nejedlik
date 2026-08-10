<template>
  <PageWrapper>
    <div class="form-wrapper">
      <h1>Nové heslo</h1>

      <p v-if="token === ''" class="error-message">
        Odkaz je neúplný. Otevřete prosím odkaz z e-mailu znovu, nebo si
        <NuxtLink :to="PASSWORD_FORGOTTEN_PATH">vyžádejte nový</NuxtLink>.
      </p>

      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="p-form-group">
          <label for="reset-password">Nové heslo</label>
          <input
            id="reset-password"
            v-model="password"
            type="password"
            name="password"
            required
            autocomplete="new-password"
            :minlength="PASSWORD_MIN_LENGTH"
          />
          <small>Alespoň {{ PASSWORD_MIN_LENGTH }} znaků.</small>
        </div>

        <div class="p-center">
          <button type="submit" class="p-button-brand" :disabled="pending">
            {{ pending ? "Ukládáme…" : "Nastavit heslo" }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
          <p>
            <NuxtLink :to="PASSWORD_FORGOTTEN_PATH">Vyžádat nový odkaz</NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const route = useRoute()

const password = ref("")
const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""))

const { execute, pending, errorMessage } = useAuthRequest(() =>
  $fetch("/api/auth/password", {
    method: "PUT",
    body: { token: token.value, password: password.value },
  }),
)

useSeoMeta({ title: "Nové heslo", robots: "noindex, nofollow" })

async function onSubmit() {
  if (!(await execute())) return

  // Directus invalidates the account's refresh tokens on reset, so there is no
  // session to carry over — sign in with the new password, which also proves
  // it took.
  await navigateTo({ path: LOGIN_PATH, query: { obnoveno: "1" } })
}
</script>

<style scoped>
.form-wrapper {
  max-width: var(--size-content-2);
  margin-inline: auto;
}

h1 {
  text-align: center;
  margin-bottom: var(--space-4);
}

form {
  max-width: 40ch;
  margin-inline: auto;
}
</style>
