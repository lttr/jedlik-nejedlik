<template>
  <button type="submit" class="p-button-brand auth-submit" :disabled="pending">
    <slot />
  </button>
</template>

<script lang="ts" setup>
const { pending = false } = defineProps<{
  pending?: boolean
}>()
</script>

<style scoped>
.auth-submit {
  margin-block-start: var(--space-2);
}
</style>
