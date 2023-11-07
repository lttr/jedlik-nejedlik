<template>
  <SanityContent :blocks="blocks" />
</template>

<script lang="ts" setup>
defineProps<{ blocks: any[] }>()
</script>
