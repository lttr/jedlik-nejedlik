<template>
  <section class="account-billing">
    <h2 class="p-heading-4">Fakturační údaje</h2>

    <p class="muted">
      Použijeme je na&nbsp;doklad k&nbsp;příští objednávce. Doklady, které už máte, se nemění.
    </p>

    <form @submit.prevent="onSave">
      <BillingDetailsForm v-model="billing" id-prefix="account-billing" />

      <!-- Wrapped: the form is a grid, and a bare button is a grid item
           stretched to the full panel. -->
      <div>
        <AuthSubmit :pending>Uložit údaje</AuthSubmit>
      </div>

      <ShopNotice v-if="saved" message="Fakturační údaje jsou uložené." tone="success" />
      <ShopNotice :message="errorMessage" />
    </form>
  </section>
</template>

<script lang="ts" setup>
import { emptyBillingDetails } from "#layers/shop/shared/utils/checkout"
import type { BillingDetails } from "#layers/shop/shared/utils/checkout"
import BillingDetailsForm from "../billing/DetailsForm.vue"
import ShopNotice from "../ShopNotice.vue"
import AuthSubmit from "#layers/auth/app/components/auth/Submit.vue"
import { useAuthForm } from "#layers/auth/app/composables/auth-form"

// The same fields the Checkout's step 2 shows, with this page's own copy and
// save button around them. Through Nitro, never Directus from the browser
// (ADR 0004).
const { data, error } = await useFetch<BillingDetails>("/api/account/billing", {
  key: "account:billing",
  default: emptyBillingDetails,
})

// A copy, not an alias: the form writes here as the Student types, and
// handing it `data.value` would edit the answer the fetch is caching.
const billing = ref<BillingDetails>({ ...data.value })

const { pending, errorMessage, succeeded: saved, submit } = useAuthForm()

// A form that could not be pre-filled is still worth showing — a Student can
// fill it in from scratch — but not without saying that what they see is not
// what is stored.
if (error.value !== undefined) {
  errorMessage.value = "Uložené údaje se teď nepodařilo načíst. Zkuste to prosím za chvíli."
}

async function onSave() {
  await submit(async () => {
    await $fetch("/api/account/billing", { method: "POST", body: billing.value })
  })
}
</script>

<style scoped>
.account-billing,
.account-billing form {
  display: grid;
  gap: var(--space-4);
}

.account-billing h2,
.account-billing p {
  margin: 0;
}
</style>
