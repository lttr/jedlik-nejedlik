<template>
  <component :is="content" v-if="content" />
</template>

<script lang="ts" setup>
import { resolveSalesContent } from "#layers/shop/app/utils/sales-content"

const { slug } = defineProps<{
  slug: string
}>()

const content = resolveSalesContent(slug)
</script>
