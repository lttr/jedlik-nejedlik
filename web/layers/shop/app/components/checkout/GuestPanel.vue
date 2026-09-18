<template>
  <ShopNotice v-if="verified" tone="success">
    E-mail je ověřený. Zadejte heslo a&nbsp;pokračujte v&nbsp;objednávce.
  </ShopNotice>

  <div class="tabs" role="tablist">
    <button
      v-for="option of TABS"
      :key="option.tab"
      type="button"
      role="tab"
      :aria-selected="tab === option.tab"
      @click="tab = option.tab"
    >
      {{ option.label }}
    </button>
  </div>

  <CheckoutLogInForm v-if="tab === 'login'" :verified @logged-in="emit('loggedIn')" />
  <CheckoutRegisterForm v-else @registered="emit('registered', $event)" />
</template>

<script lang="ts" setup>
// The two ways into an Account, side by side inside step 1 (prototype, variant
// C): „Mám účet" and „Jsem tu poprvé". Tabs rather than one long form, because
// a visitor knows which of the two they are.
const { verified = false } = defineProps<{ verified?: boolean }>()

const emit = defineEmits<{ loggedIn: []; registered: [email: string] }>()

const TABS = [
  { tab: "login", label: "Mám účet" },
  { tab: "register", label: "Jsem tu poprvé" },
] as const

// Back from the verification link there is a password to type and an account
// to type it into, so „Mám účet" is the tab that is wanted (ADR 0005) — and it
// is the right default for everyone else too.
const tab = ref<"login" | "register">("login")
</script>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  border-block-end: 1px solid var(--surface-3);
}

.tabs button {
  /* Narrow enough to keep each label on one line; at phone width the strip
     wraps to two rows, which is why `.tabs` allows wrapping at all. */
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-0);
  border: 0;
  border-block-end: 3px solid transparent;
  background: none;
  color: var(--text-color-1);
  font: inherit;
  cursor: pointer;
}

.tabs button[aria-selected="true"] {
  border-block-end-color: var(--brand-color-bright);
  font-weight: var(--font-weight-6);
}
</style>
