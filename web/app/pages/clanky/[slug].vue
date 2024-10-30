<template>
  <main class="main p-page-layout p-stack">
    <ArticleCard
      v-if="article"
      :key="article.id"
      class="post"
      heading-level="h2"
      v-bind="article"
    />
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: article } = await useArticle(route.params.slug as string)

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  })
}
</script>

<style scoped>
.main {
  padding-block: var(--space-6);
}
</style>
