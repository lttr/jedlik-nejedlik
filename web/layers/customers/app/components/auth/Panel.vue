<template>
  <section class="auth-panel p-stack">
    <h1 class="p-heading-3">{{ title }}</h1>
    <p v-if="lead" class="lead">{{ lead }}</p>
    <slot />
  </section>
</template>

<script lang="ts" setup>
const { title, lead = "" } = defineProps<{
  title: string
  lead?: string
}>()
</script>

<style scoped>
.auth-panel {
  max-width: var(--size-content-2);
  margin-inline: auto;
  margin-block: var(--space-6);
  padding: var(--space-6);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-4);
  box-shadow: var(--shadow-3);

  @media (--sm-n-below) {
    border-inline: none;
    border-radius: var(--radius-0);
    box-shadow: none;
    padding-inline: var(--space-2);
  }
}

.lead {
  color: var(--text-2);
}
</style>
