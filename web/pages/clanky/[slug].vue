<template>
  <section class="post">
    <div v-if="post">
      <h1>{{ post.title }}</h1>
      <p>{{ post.excerpt }}</p>
      <p>{{ formatDate(post._createdAt) }}</p>
      <div v-if="post.body">
        <BlockContent :blocks="post.body" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Post } from "~/types/Post"

const route = useRoute()

const query = groq`*[ _type == "post" && slug.current == $slug][0]`
const { data: post } = await useSanityQuery<Post>(query, {
  slug: route.params.slug,
})
</script>

<style scoped></style>
