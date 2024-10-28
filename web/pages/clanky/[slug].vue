<template>
  <main class="main p-page-layout p-stack">
    <ArticleCard :key="article.id" class="post" v-bind="article" />
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

interface Article {
  cover: string
  perex: string
  title: string
  image: string
  id: string
}

function getImageUrl(cover: string) {
  const directusApi = "https://obsah-jedlika.lttr.cz"
  return `${directusApi}/assets/${cover}`
}

const article = computed(() => {
  if (!result.value) {
    return
  }
  return {
    ...exampleCard,
    id: result.value.id,
    image: getImageUrl(result.value.cover),
    title: result.value.title,
    text: result.value.perex,
  }
})
const { getItemById } = useDirectusItems()

const slug = useRoute().params.slug

const { data: result } = await useAsyncData(async () => {
  return getItemById<Article>({
    collection: "articles",
    id: Array.isArray(slug) ? slug[0] : slug,
  })
})
</script>

<style scoped>
.main {
  padding-block: var(--space-6);
}
</style>
