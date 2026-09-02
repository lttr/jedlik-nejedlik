<template>
  <PageWrapper>
    <AuthPanel title="Obnova hesla">
      <!-- The link that led here is dead. There is nothing to fix on the
           password form, so it makes way for a fresh link (story 15). -->
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

      <!-- The same confirmation whether or not the address has an account:
           Directus answers 204 either way, on purpose (story 13). -->
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
// Bare title: `/obnova-hesla` is `robots: false`, so there is no point emitting
// og:* for a page that must never be indexed or shared.
useHead({ title: "Obnova hesla" })

// No `guest` middleware, for the same reason `/overeni-emailu` has none:
// following a link from an e-mail has to work whoever happens to be logged in
// on the device.

const { requestPasswordReset, resetPassword } = useAuthActions()
const { pending, errorMessage, errorCode, submit } = useAuthForm()

// One page, two legs: arriving with a token from the e-mail it sets a new
// password, arriving without one it hands out the links.
const { token } = useEmailedToken()
const mode = ref<"reset" | "request" | "sent">(token === "" ? "request" : "reset")

const email = ref("")
const password = ref("")
// The address the confirmation names back, as Directus was given it.
const requestedFor = ref("")

// The one failure that is about the link rather than about the form, named by
// the reset route rather than recognised from its Czech wording.
const linkIsDead = computed(() => errorCode.value === "invalid_token")

async function onRequest() {
  await submit(async () => {
    // Normalised here as well as on the way in, so the confirmation names the
    // address Directus was actually given.
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
      // Straight to the login form, which says why they are there — the new
      // password gets used immediately rather than being taken on trust.
      await navigateTo(
        { path: "/prihlaseni", query: { [PASSWORD_CHANGED_QUERY]: "1" } },
        { replace: true },
      )
    },
    // The instance's own rule, checked here only to save a round-trip; the
    // reset route enforces it again.
    () => validatePassword(password.value),
  )
}

function askForNewLink() {
  errorMessage.value = ""
  errorCode.value = ""
  mode.value = "request"
}
</script>
