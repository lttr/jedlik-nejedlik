<template>
  <PageWrapper>
    <AuthPanel title="Registrace">
      <template v-if="submittedEmail">
        <p class="success-message" role="status">
          Poslali jsme vám ověřovací e-mail na adresu <strong>{{ submittedEmail }}</strong
          >.
        </p>
        <p>
          <strong>Účet zatím není aktivní.</strong> Otevřete e-mail a klikněte na odkaz v něm —
          teprve tím se registrace dokončí a budete se moci přihlásit. {{ authMessages.checkSpam }}
        </p>
        <p>
          Máte už u nás účet? Pak žádný e-mail nechodí a stačí se
          <NuxtLink to="/prihlaseni">přihlásit</NuxtLink>.
        </p>
      </template>

      <form v-else @submit.prevent="onSubmit">
        <div class="p-form-group">
          <label for="register-email">E-mail</label>
          <input
            id="register-email"
            v-model="email"
            type="email"
            name="email"
            required
            autofocus
            autocomplete="email"
          />
        </div>

        <AuthPasswordField id="register-password" v-model="password" />

        <p class="consent-note">
          Registrací berete na vědomí, že zpracováváme vaše osobní údaje.
          <NuxtLink to="/zasady-zpracovani-osobnich-udaju"
            >Zásady zpracování osobních údajů</NuxtLink
          >
        </p>

        <AuthSubmit :pending>Zaregistrovat se</AuthSubmit>

        <AuthFormError :message="errorMessage" />
      </form>

      <p>Máte už účet? <NuxtLink to="/prihlaseni">Přihlaste se</NuxtLink>.</p>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "guest" })

// Bare title: the page is `robots: false`, so no og:* tags.
useHead({ title: "Registrace" })

const { register } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const password = ref("")
const submittedEmail = ref("")

async function onSubmit() {
  await submit(
    async () => {
      // Normalised here too, so the confirmation names what Directus was given.
      const address = normaliseEmail(email.value)
      await register({ email: address, password: password.value })
      submittedEmail.value = address
    },
    // Saves a round-trip; the route enforces it again.
    () => validatePassword(password.value),
  )
}
</script>

<style scoped>
.consent-note {
  font-size: var(--font-size--1);
  line-height: var(--font-lineheight-3);
  color: var(--text-2);
}
</style>
