<template>
  <div class="testimonial p-stack">
    <div class="stars">
      <Icon v-for="x of stars" :key="x" name="uil:star" class="star" />
    </div>
    <p class="p-secondary-text-regular">{{ text }}</p>
    <div class="author p-secondary-text-bold">{{ author }}</div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  stars: number
  text: string
  author: string
}>()
</script>

<style scoped>
.testimonial {
  box-shadow: var(--shadow-4);
  background-color: var(--bg-color-body);
  padding: var(--space-5);
}

.stars {
  display: flex;
  gap: var(--space-1);
}

.star {
  color: var(--color-star);
}
</style>
