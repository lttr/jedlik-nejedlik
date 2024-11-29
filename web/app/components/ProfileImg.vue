<template>
  <NuxtImg
    class="profile-image"
    sizes="400px"
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
.profile-image {
  border-radius: var(--radius-round);
  max-width: 30ch;
}
</style>
