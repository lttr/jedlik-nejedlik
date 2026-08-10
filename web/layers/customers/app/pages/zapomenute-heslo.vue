<template>
  <PageWrapper>
    <div class="form-wrapper">
      <h1>Zapomenuté heslo</h1>

      <div v-if="submitted" class="success-message">
        <p>
          Pokud k adrese <strong>{{ submittedEmail }}</strong> patří účet, poslali jsme na ni odkaz
          pro nastavení nového hesla.
        </p>
        <p>Podívejte se prosím do schránky — a pro jistotu i do spamu.</p>
      </div>

      <template v-else>
        <p class="lead">Zadejte e-mail, kterým se přihlašujete, a pošleme vám odkaz.</p>

        <form class="form" @submit.prevent="onSubmit">
          <div class="p-form-group">
            <label for="forgotten-email">E-mail</label>
            <input
              id="forgotten-email"
              v-model="email"
              type="email"
              name="email"
              required
              autocomplete="email"
            />
          </div>

          <div class="p-center">
            <button type="submit" class="p-button-brand" :disabled="pending">
              {{ pending ? "Odesíláme…" : "Poslat odkaz" }}
            </button>
          </div>

          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </form>
      </template>

      <p class="alternative">
        <NuxtLink :to="LOGIN_PATH">Zpět na přihlášení</NuxtLink>
      </p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const email = ref("")
const submitted = ref(false)
const submittedEmail = ref("")

const { execute, pending, errorMessage } = useAuthRequest(() =>
  $fetch("/api/auth/password", { method: "POST", body: { email: email.value } }),
)

useSeoMeta({ title: "Zapomenuté heslo", robots: "noindex, nofollow" })

async function onSubmit() {
  if (!(await execute())) return

  // Same confirmation either way — the server answers 204 whether or not the
  // address has an account, and this message must not give that away.
  submittedEmail.value = email.value
  submitted.value = true
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

.lead {
  text-align: center;
  color: var(--text-2);
  margin-bottom: var(--space-5);
}

form {
  max-width: 40ch;
  margin-inline: auto;
}

.alternative {
  text-align: center;
  margin-top: var(--space-5);
}
</style>
