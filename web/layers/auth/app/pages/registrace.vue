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
          teprve tím se registrace dokončí a budete se moci přihlásit. Pokud zpráva do pár minut
          nedorazí, mrkněte se prosím i do spamu.
        </p>
        <p>
          Máte už u nás účet? Pak žádný e-mail nechodí a stačí se
          <NuxtLink to="/prihlaseni">přihlásit</NuxtLink>.
        </p>
      </template>

      <form v-else class="p-stack" @submit.prevent="onSubmit">
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

        <div class="p-form-group">
          <label for="register-password">Heslo</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            name="password"
            required
            autocomplete="new-password"
            aria-describedby="register-password-hint"
          />
          <p id="register-password-hint" class="password-hint">
            Alespoň {{ PASSWORD_MIN_LENGTH }} znaků.
          </p>
        </div>

        <p class="consent-note">
          Registrací berete na vědomí, že zpracováváme vaše osobní údaje.
          <NuxtLink to="/zasady-zpracovani-osobnich-udaju"
            >Zásady zpracování osobních údajů</NuxtLink
          >
        </p>

        <button type="submit" class="p-button-brand" :disabled="pending">Zaregistrovat se</button>

        <AuthFormError :message="errorMessage" />

        <p>Máte už účet? <NuxtLink to="/prihlaseni">Přihlaste se</NuxtLink>.</p>
      </form>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "guest" })

// Bare title: `/registrace` is `robots: false`, so there is no point emitting
// og:* for a page that must never be indexed or shared.
useHead({ title: "Registrace" })

const { register } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const password = ref("")
// Set once the route answered; also the address the confirmation names back.
const submittedEmail = ref("")

async function onSubmit() {
  await submit(
    async () => {
      // Normalised here as well as on the way in, so the confirmation names
      // the address Directus was actually given.
      const address = normaliseEmail(email.value)
      await register({ email: address, password: password.value })
      submittedEmail.value = address
    },
    // The instance's own rule, checked here only to save a round-trip; the
    // register route enforces it again.
    () => validatePassword(password.value),
  )
}
</script>

<style scoped>
.password-hint,
.consent-note {
  font-size: var(--font-size--1);
  line-height: var(--font-lineheight-3);
  color: var(--text-2);
}
</style>
