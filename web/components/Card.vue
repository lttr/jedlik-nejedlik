<template>
  <div class="card">
    <div>
      <h3>
        <NuxtLink :to="`/clanky/${post.slug.current}`">
          {{ post.title }}
        </NuxtLink>
      </h3>
      <p>{{ post.excerpt }}</p>
      <p>{{ formatDate(post._createdAt) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from "~/types/Post";

defineProps<{
  post: Post;
}>();
</script>

<style scoped></style>
