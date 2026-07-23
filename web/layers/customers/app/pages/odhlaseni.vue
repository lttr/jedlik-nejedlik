<template>
  <PageWrapper root-element="article" class="p-prose auth-page">
    <h1>Odhlašování…</h1>
    <p>Za okamžik budete přesměrováni.</p>
  </PageWrapper>
</template>

<script setup lang="ts">
const { logout } = useAuth()

// `logout()` clears the session and redirects to /prihlaseni.
onMounted(() => {
  void logout()
})

useSeoMeta({ title: "Odhlášení", robots: "noindex, nofollow" })
</script>
