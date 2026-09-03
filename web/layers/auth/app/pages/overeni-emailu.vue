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
useHead({ title: "Ověření e-mailu" })

const { verifyEmail } = useAuthActions()
const { errorMessage, submit } = useAuthForm()

const { token, scrubbed } = useEmailedToken()

onMounted(async () => {
  await scrubbed

  await submit(async () => {
    // A missing token is posted like any other; the route is the single judge.
    await verifyEmail(token)
    await navigateTo(
      { path: "/prihlaseni", query: { [EMAIL_VERIFIED_QUERY]: "1" } },
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
