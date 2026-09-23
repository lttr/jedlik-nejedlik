<template>
  <CheckoutStep :number="1" title="Účet" :done="email !== null">
    <p v-if="email !== null" class="muted">
      Přihlášeni jako <strong>{{ email }}</strong>
    </p>

    <!-- The verification link wins over this panel: the Account came back to
         finish the order, not to be told to check their inbox again. -->
    <template v-else-if="registeredEmail !== '' && !verified">
      <ShopNotice tone="success">
        Poslali jsme vám ověřovací e-mail na&nbsp;adresu <strong>{{ registeredEmail }}</strong
        >.
      </ShopNotice>
      <p>
        <strong>Účet zatím není aktivní.</strong> Registraci dokončíte kliknutím na&nbsp;odkaz
        v&nbsp;e-mailu. Pak se sem vrátíte a&nbsp;objednávku dokončíte.
        {{ authMessages.checkSpam }}
      </p>
    </template>

    <CheckoutGuestPanel
      v-else
      :verified
      @logged-in="emit('loggedIn')"
      @registered="registeredEmail = $event"
    />
  </CheckoutStep>
</template>

<script lang="ts" setup>
import ShopNotice from "../ShopNotice.vue"
import CheckoutGuestPanel from "./GuestPanel.vue"
import CheckoutStep from "./Step.vue"
import { authMessages } from "#layers/auth/shared/utils/auth-messages"

// Step 1 of the Checkout: for a Student the collapsed line with their e-mail,
// which is all the step ever was; for a visitor without an Account the way to
// become one without leaving the page (prototype, variant C).
const { email, verified = false } = defineProps<{
  // `null` for a visitor; their address once they are logged in.
  email: string | null
  // They came back from the verification link, so the address is known and
  // only the password is missing (ADR 0005).
  verified?: boolean
}>()

const emit = defineEmits<{ loggedIn: [] }>()

// Not persisted on purpose: a reload is a fresh start.
const registeredEmail = ref("")
</script>
