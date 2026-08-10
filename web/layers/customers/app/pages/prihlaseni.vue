<template>
  <PageWrapper>
    <div class="form-wrapper">
      <h1>Přihlášení</h1>

      <form class="form" @submit.prevent="onSubmit">
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

        <div class="p-center">
          <button type="submit" class="p-button-brand" :disabled="pending">
            {{ pending ? "Přihlašujeme…" : "Přihlásit se" }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const route = useRoute()
const { fetch: refreshSession } = useUserSession()

const email = ref("")
const password = ref("")

const { execute, pending, errorMessage } = useAuthRequest(() =>
  $fetch("/api/auth/login", {
    method: "POST",
    body: { email: email.value, password: password.value },
  }),
)

useSeoMeta({ title: "Přihlášení", robots: "noindex, nofollow" })

async function onSubmit() {
  if (!(await execute())) return

  // Pull the new session before leaving, so the destination renders signed in
  // on its first pass instead of flashing the signed-out state.
  await refreshSession()
  await navigateTo(safeNextPath(route.query.next))
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
