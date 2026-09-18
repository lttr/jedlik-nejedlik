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
import { emptyBillingDetails } from "../../../shared/utils/checkout"
import type { BillingDetails } from "../../../shared/utils/checkout"

// „Fakturační údaje" on the Account page (spec, user story 21): the same form
// the Checkout's step 2 shows, with its own copy and its own save button
// around it. The fields themselves are `<BillingDetailsForm>` in both places,
// so the two can never drift apart.
//
// Through Nitro, never Directus from the browser (ADR 0004); the page is
// behind the auth middleware, so there is always a session by the time this
// runs.
const { data, error } = await useFetch<BillingDetails>("/api/account/billing", {
  key: "account:billing",
  default: emptyBillingDetails,
})

// A copy: the form edits it as the Student types, and a failed save must not
// silently reset what they wrote.
const billing = ref<BillingDetails>(data.value)

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
/* The panel's own flow does not reach inside a section, so the heading, the
   intro line and the form space themselves. */
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
