<template>
  <PageWrapper>
    <AuthPanel title="Registrace" lead="Stačí e-mail a heslo. Jméno vyplníte až u objednávky.">
      <form class="p-stack" @submit.prevent="onSubmit">
        <div class="p-form-group">
          <label for="register-email">E-mail</label>
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
          <label for="register-password">Heslo</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            name="password"
            required
            autocomplete="new-password"
          />
          <p class="hint">Alespoň {{ PASSWORD_MIN_LENGTH }} znaků.</p>
        </div>

        <p class="privacy-note">
          Registrací berete na vědomí, že budeme zpracovávat vaše osobní údaje podle
          <NuxtLink to="/zasady-zpracovani-osobnich-udaju">
            Zásad zpracování osobních údajů </NuxtLink
          >.
        </p>

        <button type="submit" class="p-button-brand" :disabled="pending">Zaregistrovat se</button>

        <AuthFormError :message="errorMessage" />
      </form>

      <p>
        Už máte účet?
        <NuxtLink :to="{ path: '/prihlaseni', query: route.query }">Přihlaste se</NuxtLink>
      </p>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "guest" })

useSeoMeta({ title: "Registrace | Jedlík-nejedlík" })

const route = useRoute()
const { register } = useAuthActions()

const email = ref("")
const password = ref("")
const pending = ref(false)
const errorMessage = ref("")

async function onSubmit() {
  if (password.value.length < PASSWORD_MIN_LENGTH) {
    errorMessage.value = authMessages.passwordTooShort
    return
  }

  pending.value = true
  errorMessage.value = ""
  try {
    await register({ email: email.value, password: password.value })
    await navigateTo(safeRedirectPath(route.query.redirect))
  } catch (error) {
    errorMessage.value = authErrorMessage(error)
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.hint,
.privacy-note {
  font-size: var(--font-size--1);
  color: var(--text-2);
}
</style>
