<template>
  <p v-if="message" class="error-message" role="alert">{{ message }}</p>
</template>

<script lang="ts" setup>
const { message = "" } = defineProps<{
  message?: string
}>()
</script>
