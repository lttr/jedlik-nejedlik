<template>
  <ShopNotice v-if="verified" tone="success">
    E-mail je ověřený. Zadejte heslo a&nbsp;pokračujte v&nbsp;objednávce.
  </ShopNotice>

  <!-- `role="tablist"` is a promise the rest of the widget has to keep: each
       tab names the panel it controls, the panel names its tab back, and only
       the selected tab is in the tab order — arrow keys move between them,
       which is what a screen reader tells its user to press. -->
  <div class="tabs" role="tablist">
    <button
      v-for="(option, index) of TABS"
      :id="`checkout-tab-${option.tab}`"
      :key="option.tab"
      ref="tabButtons"
      type="button"
      role="tab"
      :aria-selected="tab === option.tab"
      :aria-controls="`checkout-panel-${option.tab}`"
      :tabindex="tab === option.tab ? 0 : -1"
      @click="tab = option.tab"
      @keydown.left.prevent="select(index - 1)"
      @keydown.right.prevent="select(index + 1)"
    >
      {{ option.label }}
    </button>
  </div>

  <div :id="`checkout-panel-${tab}`" role="tabpanel" :aria-labelledby="`checkout-tab-${tab}`">
    <CheckoutLogInForm v-if="tab === 'login'" :verified @logged-in="emit('loggedIn')" />
    <CheckoutRegisterForm v-else @registered="emit('registered', $event)" />
  </div>
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

// Back from the verification link the Account already exists and only the
// password is left to type, so „Mám účet" is the tab that is wanted (ADR
// 0005) — and it is the right default for everyone else too.
const tab = ref<"login" | "register">("login")

const tabButtons = useTemplateRef<HTMLButtonElement[]>("tabButtons")

// Arrow keys wrap, as a tablist is expected to. The strip only ever holds two
// tabs, so left and right do the same thing; spelling both out is still less
// surprising than one of them doing nothing.
//
// Focus has to follow the selection, not just the highlight: the tab left
// behind drops out of the tab order the moment it is deselected, so a keyboard
// user whose focus stayed on it would be stranded — the next arrow key would
// be handled by the old tab and compute the same move again.
async function select(index: number): Promise<void> {
  const wrapped = (index + TABS.length) % TABS.length
  const next = TABS[wrapped]
  if (next === undefined) {
    return
  }
  tab.value = next.tab
  await nextTick()
  tabButtons.value?.[wrapped]?.focus()
}
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
