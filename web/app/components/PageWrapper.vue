<template>
  <component :is="element" :class="{ 'p-page-layout': isPageLayout }">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
const { rootElement: element = "div", isPageLayout = true } = defineProps<{
  rootElement?: string
  isPageLayout?: boolean
}>()
</script>

<style scoped>
main {
  row-gap: var(--space-7);
  margin-bottom: var(--space-7);
}
</style>
