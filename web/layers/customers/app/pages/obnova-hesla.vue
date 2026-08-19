<template>
  <PageWrapper>
    <AuthPanel v-if="token" title="Nové heslo">
      <form v-if="!confirmation" class="p-stack" @submit.prevent="onReset">
        <div class="p-form-group">
          <label for="reset-password">Nové heslo</label>
          <input
            id="reset-password"
            v-model="password"
            type="password"
            name="password"
            required
            autocomplete="new-password"
          />
          <p class="hint">Alespoň {{ PASSWORD_MIN_LENGTH }} znaků.</p>
        </div>

        <button type="submit" class="p-button-brand" :disabled="pending">Nastavit heslo</button>

        <AuthFormError :message="errorMessage" />
      </form>

      <template v-else>
        <p>{{ confirmation }}</p>
        <NuxtLink to="/prihlaseni">Přihlaste se novým heslem</NuxtLink>
      </template>

      <p v-if="errorMessage">
        <NuxtLink to="/obnova-hesla">Nechat si poslat nový odkaz</NuxtLink>
      </p>
    </AuthPanel>

    <AuthPanel
      v-else
      title="Zapomenuté heslo"
      lead="Zadejte e-mail, kterým se přihlašujete, a pošleme vám odkaz pro nastavení nového hesla."
    >
      <form v-if="!confirmation" class="p-stack" @submit.prevent="onRequest">
        <div class="p-form-group">
          <label for="reset-email">E-mail</label>
          <input
            id="reset-email"
            v-model="email"
            type="email"
            name="email"
            required
            autocomplete="email"
          />
        </div>

        <button type="submit" class="p-button-brand" :disabled="pending">Poslat odkaz</button>

        <AuthFormError :message="errorMessage" />
      </form>

      <p v-else>{{ confirmation }}</p>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
useSeoMeta({ title: "Obnova hesla | Jedlík-nejedlík" })

const route = useRoute()
const { requestPasswordReset, resetPassword } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

// Directus appends `?token=` to the reset link it e-mails, which is what
// turns this page from "ask for a link" into "set a new password".
const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""))

const email = ref("")
const password = ref("")
const confirmation = ref("")

async function onRequest() {
  await submit(async () => {
    confirmation.value = await requestPasswordReset(email.value)
  })
}

async function onReset() {
  if (password.value.length < PASSWORD_MIN_LENGTH) {
    errorMessage.value = authMessages.passwordTooShort
    return
  }

  await submit(async () => {
    confirmation.value = await resetPassword({ token: token.value, password: password.value })
  })
}
</script>

<style scoped>
.hint {
  font-size: var(--font-size--1);
  color: var(--text-2);
}
</style>
