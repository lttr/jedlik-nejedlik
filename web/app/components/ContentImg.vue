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
  loading?: "lazy" | "eager"
}>()
</script>

<style scoped>
.content-image {
  display: block;
  margin-block: var(--space-7);
  margin-inline: auto;
  width: 100%;
  max-width: 964px;
  height: auto;
  border-radius: var(--radius-2);
}
</style>
