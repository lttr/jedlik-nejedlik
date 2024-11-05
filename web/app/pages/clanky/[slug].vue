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
const article = ref<Card>()
const route = useRoute("clanky-slug")
if (typeof route.params.slug === "string") {
  const { data } = await useArticle(route.params.slug)
  if (data) {
    article.value = data.value
  }
}

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  })
}
</script>

<style scoped></style>
