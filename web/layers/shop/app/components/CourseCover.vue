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
// The one place a Course cover becomes an `<img>`: the Catalog card and the
// Sales Page hero frame it identically (16/9, cropped), and the cover's own
// `description` is the alt text — empty when it has none, because a cover
// next to the Course's title carries nothing a screen reader needs twice.
// `sizes`, `loading` and `fetchpriority` differ per call site and fall
// through as attributes.
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
