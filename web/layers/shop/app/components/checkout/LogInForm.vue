<template>
  <form @submit.prevent="onSubmit">
    <div class="p-form-group">
      <label for="checkout-login-email">E-mail</label>
      <input
        id="checkout-login-email"
        v-model="email"
        type="email"
        name="email"
        required
        autocomplete="email"
      />
    </div>

    <div class="p-form-group">
      <label for="checkout-login-password">Heslo</label>
      <input
        id="checkout-login-password"
        v-model="password"
        type="password"
        name="password"
        required
        autocomplete="current-password"
      />
    </div>

    <div>
      <AuthSubmit :pending>{{ verified ? "Pokračovat" : "Přihlásit se" }}</AuthSubmit>
    </div>

    <ShopNotice :message="errorMessage" />

    <p class="p-secondary-text-regular">
      <NuxtLink :to="RESET_PASSWORD_PATH">Zapomněli jste heslo?</NuxtLink>
    </p>
  </form>
</template>

<script lang="ts" setup>
const { verified = false } = defineProps<{
  // Back from the verification link: the address is known and the button says
  // „Pokračovat", because this is the end of an interruption (ADR 0005).
  verified?: boolean
}>()

const emit = defineEmits<{ loggedIn: [] }>()

const { logIn } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const password = ref("")

const rememberedEmail = useRememberedCheckoutEmail()

// Fires after mount, when the stored address has been read.
watch(rememberedEmail, (address) => {
  if (verified && email.value === "") {
    email.value = address
  }
})

async function onSubmit(): Promise<void> {
  await submit(async () => {
    await logIn({ email: email.value, password: password.value })
    // Used up, like the cookie: the next purchase starts from a clean step 1.
    rememberedEmail.value = ""
    emit("loggedIn")
  })
}
</script>
