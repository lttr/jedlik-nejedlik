<template>
  <form @submit.prevent="onSubmit">
    <div class="p-form-group">
      <label for="checkout-register-email">E-mail</label>
      <input
        id="checkout-register-email"
        v-model="email"
        type="email"
        name="email"
        required
        autocomplete="email"
      />
    </div>

    <AuthPasswordField id="checkout-register-password" v-model="password" />

    <!-- No session until the e-mail is verified (ADR 0005), so the password
         has to be typed a second time at login. That is a wart; saying so up
         front at least makes it never a surprise. -->
    <p class="hint">
      Pošleme vám e-mail s&nbsp;odkazem pro ověření. Po&nbsp;ověření se stejným heslem přihlásíte
      a&nbsp;objednávku dokončíte.
    </p>

    <div>
      <AuthSubmit :pending>Vytvořit účet</AuthSubmit>
    </div>

    <ShopNotice :message="errorMessage" />
  </form>
</template>

<script lang="ts" setup>
// „Jsem tu poprvé": the registration page's form, inside step 1 of the
// Checkout. Nobody is logged in afterwards — the account is Unverified until
// the e-mailed link is followed (ADR 0005) — so the step says so instead.
const emit = defineEmits<{ registered: [email: string] }>()

const { register } = useAuthActions()
const { pending, errorMessage, submit } = useAuthForm()

const email = ref("")
const password = ref("")

const rememberedEmail = useRememberedCheckoutEmail()

async function onSubmit(): Promise<void> {
  await submit(
    async () => {
      const address = normaliseEmail(email.value)
      await register({ email: address, password: password.value })
      rememberedEmail.value = address
      emit("registered", address)
    },
    () => validatePassword(password.value),
  )
}
</script>

<style scoped>
.hint {
  color: var(--text-color-2);
  font-size: var(--font-size-0);
}
</style>
