<template>
  <section v-if="posts">
    <PostCard v-for="post of posts" :key="post._id" :post="post" />
  </section>
</template>

<script setup lang="ts">
import { type Post } from "~/types/Post"

const query = groq`*[ _type == "post" && defined(slug.current) ] | order(_createdAt desc)`
const { data: posts } = await useSanityQuery<Post[]>(query)
</script>
