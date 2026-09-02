<template>
  <PageWrapper>
    <AuthPanel title="Obnova hesla">
      <!-- Dead link: nothing to fix on the form, so offer a fresh link. -->
      <template v-if="linkIsDead">
        <AuthFormError :message="errorMessage" />
        <p>Nechte si prosím poslat nový odkaz — ten původní platí jen omezenou dobu.</p>
        <button type="button" class="p-button-brand" @click="askForNewLink">
          Poslat nový odkaz
        </button>
      </template>

      <form v-else-if="mode === 'reset'" @submit.prevent="onReset">
        <p>Zadejte prosím nové heslo ke svému účtu.</p>

        <AuthPasswordField id="reset-password" v-model="password" label="Nové heslo" autofocus />

        <AuthSubmit :pending>Nastavit nové heslo</AuthSubmit>

        <AuthFormError :message="errorMessage" />
      </form>

      <!-- Same confirmation whether or not the address has an account. -->
      <template v-else-if="mode === 'sent'">
        <p class="success-message" role="status">{{ authMessages.resetLinkSent }}</p>
        <p>
          Odkaz jsme poslali na adresu <strong>{{ requestedFor }}</strong
          >. {{ authMessages.checkSpam }}
        </p>
      </template>

      <form v-else @submit.prevent="onRequest">
        <p>
          Zadejte e-mail, kterým se přihlašujete. Pošleme na něj odkaz pro nastavení nového hesla.
        </p>

        <div class="p-form-group">
          <label for="reset-email">E-mail</label>
          <input
            id="reset-email"
            v-model="email"
            type="email"
            name="email"
            required
            autofocus
            autocomplete="email"
          />
        </div>

        <AuthSubmit :pending>Poslat odkaz</AuthSubmit>

        <AuthFormError :message="errorMessage" />
      </form>

      <p>Vzpomněli jste si na heslo? <NuxtLink to="/prihlaseni">Přihlaste se</NuxtLink>.</p>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
// Bare title: the page is `robots: false`, so no og:* tags.
useHead({ title: "Obnova hesla" })

// No `guest` middleware: a link from an e-mail has to work whoever is logged
// in on the device.

const { requestPasswordReset, resetPassword } = useAuthActions()
const { pending, errorMessage, errorCode, submit } = useAuthForm()

// With a token from the e-mail the page sets a password; without one it
// hands out the links.
const { token } = useEmailedToken()
const mode = ref<"reset" | "request" | "sent">(token === "" ? "request" : "reset")

const email = ref("")
const password = ref("")
const requestedFor = ref("")

// The one failure about the link rather than the form.
const linkIsDead = computed(() => errorCode.value === "invalid_token")

async function onRequest() {
  await submit(async () => {
    // Normalised here too, so the confirmation names what Directus was given.
    const address = normaliseEmail(email.value)
    await requestPasswordReset(address)
    requestedFor.value = address
    mode.value = "sent"
  })
}

async function onReset() {
  await submit(
    async () => {
      await resetPassword(token, password.value)
      // Straight to the login form, so the new password gets used at once.
      await navigateTo(
        { path: "/prihlaseni", query: { [PASSWORD_CHANGED_QUERY]: "1" } },
        { replace: true },
      )
    },
    // Saves a round-trip; the route enforces it again.
    () => validatePassword(password.value),
  )
}

function askForNewLink() {
  errorMessage.value = ""
  errorCode.value = ""
  mode.value = "request"
}
</script>
