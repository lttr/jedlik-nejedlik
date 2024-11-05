<template>
  <PageWrapper>
    <ArticleCard
      v-if="article"
      :key="article.id"
      class="post"
      heading-level="h2"
      v-bind="article"
    />
  </PageWrapper>
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

<style scoped></style>
