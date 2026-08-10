<template>
  <PageWrapper>
    <div class="form-wrapper">
      <h1>Registrace</h1>

      <p v-if="!submitted" class="lead">
        Účet potřebujete k nákupu i ke studiu kurzu. Po registraci vám přijde e-mail s odkazem,
        kterým účet potvrdíte.
      </p>

      <div v-if="submitted" class="success-message">
        <p>
          Pokud e-mail <strong>{{ submittedEmail }}</strong> ještě nemá účet, poslali jsme na něj
          odkaz pro potvrzení registrace.
        </p>
        <p>Podívejte se prosím do schránky — a pro jistotu i do spamu.</p>
      </div>

      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="p-form-group">
          <label for="register-first-name">Jméno</label>
          <input
            id="register-first-name"
            v-model="firstName"
            type="text"
            name="firstName"
            autocomplete="given-name"
          />
        </div>

        <div class="p-form-group">
          <label for="register-last-name">Příjmení</label>
          <input
            id="register-last-name"
            v-model="lastName"
            type="text"
            name="lastName"
            autocomplete="family-name"
          />
        </div>

        <div class="p-form-group">
          <label for="register-email">E-mail *</label>
          <input
            id="register-email"
            v-model="email"
            type="email"
            name="email"
            required
            autocomplete="email"
          />
        </div>

        <div class="p-form-group">
          <label for="register-password">Heslo *</label>
          <input
            id="register-password"
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
            {{ pending ? "Registrujeme…" : "Zaregistrovat se" }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>

      <p class="alternative">Už máte účet? <NuxtLink :to="LOGIN_PATH">Přihlaste se</NuxtLink>.</p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const submitted = ref(false)
const submittedEmail = ref("")

const { execute, pending, errorMessage } = useAuthRequest(() =>
  $fetch("/api/auth/register", {
    method: "POST",
    body: {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    },
  }),
)

useSeoMeta({ title: "Registrace", robots: "noindex, nofollow" })

async function onSubmit() {
  if (!(await execute())) return

  // Deliberately the same confirmation whether or not the address was already
  // registered — the server answers 204 either way (spec decision 6).
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
