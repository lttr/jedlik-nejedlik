<template>
  <NuxtImg
    class="content-image"
    sizes="90vw sm:800px"
    :loading
    :src="image.id"
    :width="image.width"
    :height="image.height"
    :alt
  />
</template>

<script lang="ts" setup>
interface Image {
  id: string
  width?: number
  height?: number
  alt?: string
}

const { loading = "lazy", alt = "" } = defineProps<{
  image: Image
  alt?: string
  loading?: string
}>()
</script>

<style scoped>
.content-image {
  margin-block: var(--space-7);
}
</style>
