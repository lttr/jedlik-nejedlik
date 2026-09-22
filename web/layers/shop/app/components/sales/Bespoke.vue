<template>
  <component :is="content" v-if="content" />
</template>

<script lang="ts" setup>
const { slug } = defineProps<{
  slug: string
}>()

const content = resolveSalesContent(slug)
</script>
