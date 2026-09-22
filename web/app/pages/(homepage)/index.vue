<template>
  <main class="main p-page-layout">
    <AboutProjectSection />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "homepage",
})
</script>

<style scoped>
.main {
  row-gap: var(--space-9);
  padding-top: var(--space-9);
  padding-bottom: var(--space-9);
}
</style>
