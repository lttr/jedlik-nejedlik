<template>
  <NuxtLink :to="to" class="webinar-card">
    <p v-if="badge" class="webinar-badge">{{ badge }}</p>
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  to: string
  badge?: string
}>()
</script>

<style scoped>
.webinar-card {
  padding: var(--space-5);
  background: var(--color-peach);
  border-radius: var(--radius-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.webinar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
}

.webinar-badge {
  align-self: flex-start;
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
  color: var(--color-burgundy-red);
  background: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-round);
  margin: 0;
}

.webinar-card :deep(h3) {
  margin: 0;
  font-size: var(--font-size-2);
  color: var(--brand-color);
}

.webinar-card :deep(p) {
  margin: 0;
  color: var(--text-2);
}

.webinar-card :deep(.webinar-meta) {
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-5);
}
</style>
