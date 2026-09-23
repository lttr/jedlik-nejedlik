<template>
  <PageWrapper>
    <AuthPanel title="Registrace">
      <template v-if="submittedEmail">
        <p class="success-message" role="status">
          Poslali jsme vám ověřovací e-mail na adresu <strong>{{ submittedEmail }}</strong
          >.
        </p>
        <p>
          <strong>Účet zatím není aktivní.</strong> Registraci dokončíte kliknutím na odkaz
          v&nbsp;e-mailu. Teprve pak se budete moci přihlásit. {{ authMessages.checkSpam }}
        </p>
        <p>
          Pokud u&nbsp;nás účet už máte, žádný e-mail nepřijde a&nbsp;stačí se
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
import AuthFormError from "../components/auth/FormError.vue"
import AuthPanel from "../components/auth/Panel.vue"
import AuthPasswordField from "../components/auth/PasswordField.vue"
import AuthSubmit from "../components/auth/Submit.vue"
import { useAuthActions } from "../composables/auth"
import { useAuthForm } from "../composables/auth-form"
import { authMessages } from "#layers/auth/shared/utils/auth-messages"
import { normaliseEmail } from "#layers/auth/shared/utils/email"
import { validatePassword } from "#layers/auth/shared/utils/password"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"

definePageMeta({ middleware: "guest" })

useHead({ title: "Registrace" })

const { register } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const password = ref("")
const submittedEmail = ref("")

async function onSubmit() {
  await submit(
    async () => {
      const address = normaliseEmail(email.value)
      await register({ email: address, password: password.value })
      submittedEmail.value = address
    },
    () => validatePassword(password.value),
  )
}
</script>

<style scoped>
.consent-note {
  font-size: var(--font-size--1);
  line-height: var(--font-lineheight-3);
  color: var(--text-color-2);
}
</style>
