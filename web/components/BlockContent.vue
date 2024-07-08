<template>
  <SanityContent :blocks="blocks" />
</template>

<script lang="ts" setup>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{ blocks: any[] }>()
</script>
