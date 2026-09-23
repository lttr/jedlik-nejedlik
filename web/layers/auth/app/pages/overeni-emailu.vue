<template>
  <PageWrapper>
    <AuthPanel title="Ověření e-mailu">
      <!-- Request still running, or already forwarded to the login form. -->
      <p v-if="errorMessage === ''" class="verifying" role="status">
        <span class="verifying-spinner" aria-hidden="true" />
        Ověřujeme váš e-mail…
      </p>

      <template v-else>
        <AuthFormError :message="errorMessage" />
        <p>Pokud jste registraci už dokončili, zkuste se rovnou přihlásit.</p>

        <NuxtLink to="/prihlaseni" class="p-button p-button-brand">Přihlásit se</NuxtLink>

        <p class="p-secondary-text-regular">
          Přihlášení neprojde?
          <NuxtLink to="/registrace">Zaregistrujte se znovu</NuxtLink> a&nbsp;přijde vám nový
          ověřovací e-mail.
        </p>
      </template>
    </AuthPanel>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { pendingCheckoutPath } from "#layers/base/shared/utils/pending-checkout"
import AuthFormError from "../components/auth/FormError.vue"
import AuthPanel from "../components/auth/Panel.vue"
import { useAuthActions } from "../composables/auth"
import { useAuthForm } from "../composables/auth-form"
import { useEmailedToken } from "../composables/emailed-token"
import { EMAIL_VERIFIED_QUERY } from "#layers/auth/shared/utils/redirects"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"
import { takePendingCheckoutSlug } from "../utils/pending-checkout"

useHead({ title: "Ověření e-mailu" })

const { verifyEmail } = useAuthActions()
const { errorMessage, submit } = useAuthForm()

const { token, scrubbed } = useEmailedToken()

onMounted(async () => {
  await scrubbed

  await submit(async () => {
    // A missing token is posted like any other; the route is the single judge.
    await verifyEmail(token)
    // Back to the Checkout this Account was on, where step 1 asks for the
    // password and nothing else (ADR 0005). Without a pending Checkout the
    // login page says the same thing it always did.
    const checkout = pendingCheckoutPath(await takePendingCheckoutSlug())
    await navigateTo(
      { path: checkout ?? "/prihlaseni", query: { [EMAIL_VERIFIED_QUERY]: "1" } },
      { replace: true },
    )
  })
})
</script>

<style scoped>
.verifying {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  color: var(--text-color-2);
}

.verifying-spinner {
  width: 1.25em;
  height: 1.25em;
  border: 2px solid var(--surface-3);
  border-block-start-color: var(--brand-color-bright);
  border-radius: var(--radius-round);
  animation: verifying-spin 800ms linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .verifying-spinner {
    animation-duration: 2400ms;
  }
}

@keyframes verifying-spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
