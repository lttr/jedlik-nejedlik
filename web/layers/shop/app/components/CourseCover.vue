<template>
  <NuxtImg
    class="course-cover"
    :src="image.id"
    :width="image.width"
    :height="image.height"
    :alt="image.description ?? ''"
  />
</template>

<script lang="ts" setup>
// The cover's own `description` is the alt text, empty when it has none:
// beside the Course's title a cover carries nothing a screen reader needs
// twice.
defineProps<{
  image: Image
}>()
</script>

<style scoped>
.course-cover {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
</style>
