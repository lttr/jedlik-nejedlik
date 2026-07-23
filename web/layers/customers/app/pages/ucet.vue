<template>
  <PageWrapper root-element="article" class="p-prose auth-page">
    <h1>Můj účet</h1>

    <p>
      Přihlášen(a) jako <strong>{{ user?.email }}</strong
      >.
    </p>

    <div class="p-center">
      <button type="button" class="p-button-brand" @click="onLogout">Odhlásit se</button>
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" })

const { user, logout } = useAuth()

async function onLogout() {
  await logout()
}

useSeoMeta({ title: "Můj účet", robots: "noindex, nofollow" })
</script>
