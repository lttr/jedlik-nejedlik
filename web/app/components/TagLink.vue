<template>
  <NuxtLink class="chip p-secondary-text-regular" :to>
    <slot></slot>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  to: string
}>()
</script>

<style scoped>
.chip {
  padding-inline: var(--space-2);
  padding-block: 3px;
  border-radius: var(--radius-default);
  border: var(--border-3);
  color: var(--text-color-2);
  text-decoration: none;

  &:hover {
    color: var(--text-color-1);
    border: var(--border-4);
  }
}
</style>
