<template>
  <component :is="content" v-if="content" />
</template>

<script lang="ts" setup>
// The slot between hero and outline: the Course's hand-built copy when the
// registry (`utils/sales-content.ts`) has an entry for its slug, nothing at
// all otherwise. A missing entry is the normal state, not an error.
const { slug } = defineProps<{
  slug: string
}>()

const content = resolveSalesContent(slug)
</script>
