<template>
  <PageWrapper>
    <div class="verify-wrapper">
      <h1>Potvrzení registrace</h1>

      <p v-if="pending">Ověřujeme váš účet…</p>

      <div v-else-if="verified" class="success-message p-stack">
        <p>Účet je potvrzený. Můžete se přihlásit.</p>
        <p>
          <NuxtLink class="p-button-brand" :to="LOGIN_PATH">Přihlásit se</NuxtLink>
        </p>
      </div>

      <div v-else class="error-message p-stack">
        <p>{{ errorMessage }}</p>
        <p>
          <NuxtLink :to="REGISTER_PATH">Zpět na registraci</NuxtLink>
        </p>
      </div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
const route = useRoute()

const verified = ref(false)
const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""))

const { execute, pending, errorMessage } = useAuthRequest(() =>
  $fetch("/api/auth/verify", { method: "POST", body: { token: token.value } }),
)

useSeoMeta({ title: "Potvrzení registrace", robots: "noindex, nofollow" })

// Verification runs on the client only: it is a one-shot state change, and
// letting SSR fire it would spend the token on a prefetch or a reload.
onMounted(async () => {
  verified.value = await execute()
})
</script>

<style scoped>
.verify-wrapper {
  max-width: var(--size-content-2);
  margin-inline: auto;
  text-align: center;
}

h1 {
  margin-bottom: var(--space-4);
}
</style>
