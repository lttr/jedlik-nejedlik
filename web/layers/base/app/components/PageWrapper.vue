<template>
  <component :is="element" :class="{ 'p-page-layout': isPageLayout }" class="page-wrapper">
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
.page-wrapper {
  margin-bottom: var(--space-7);
}
</style>
