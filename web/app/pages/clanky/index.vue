<template>
  <PageWrapper>
    <div class="p-stack">
      <h1>Články</h1>
      <ArticleCard
        v-for="article of articles"
        :key="article.id"
        class="post"
        heading-level="h2"
        v-bind="article"
      />
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
const { data: articles } = await useArticles()

if (!articles.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  })
}
</script>

<style scoped></style>
