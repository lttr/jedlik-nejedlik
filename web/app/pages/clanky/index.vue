<template>
  <main class="main p-page-layout">
    <div class="p-stack">
      <h1>Články</h1>
      <ArticleCard
        v-for="article of articles"
        :key="article.id"
        class="post"
        v-bind="article"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
const exampleCard = {
  image: "/child-placeholder.webp",
  to: "/",
  tags: [
    { text: "jedlík", to: "/" },
    { text: "nejedlík", to: "/" },
  ],
  title: "Jedlík nejedlík",
  text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Aliquam erat volutpat.",
  ctaText: "Přihlásit se",
  headingLevel: "h2" as const,
}

const articles = computed(() => {
  return results.value?.map((article) => {
    return {
      ...exampleCard,
      id: article.id,
      image: getImageUrl(article.cover),
      title: article.title,
      text: article.perex,
      to: `/clanky/${article.id}`,
    }
  })
})

const { data: results } = useArticles()

if (!results.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  })
}
</script>

<style scoped>
.main {
  margin-bottom: var(--space-6);
}
</style>
