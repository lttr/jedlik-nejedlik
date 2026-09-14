<template>
  <PageWrapper>
    <article v-if="course" class="sales-page p-flow">
      <header class="hero">
        <NuxtImg
          v-if="course.cover"
          class="cover"
          sizes="90vw md:640px"
          fetchpriority="high"
          :src="course.cover.id"
          :width="course.cover.width"
          :height="course.cover.height"
          :alt="course.cover.description ?? ''"
        />
        <div class="hero-body p-flow">
          <h1>{{ course.title }}</h1>
          <p v-if="course.description" class="teaser">{{ course.description }}</p>
          <p class="offer">
            <strong v-if="course.price_czk !== undefined" class="price">
              {{ formatPriceCzk(course.price_czk) }}
            </strong>
            <NuxtLink :to="`/objednavka/${course.slug}`" class="p-button p-button-brand"
              >Koupit kurz</NuxtLink
            >
          </p>
        </div>
      </header>

      <!-- The bespoke block: hand-built copy for Courses that have some,
           nothing for the rest. The skeleton keeps everything else (spec,
           "Where content lives"). -->
      <SalesBespoke :slug />

      <SalesOutline :sections="course.sections" />
    </article>
  </PageWrapper>
</template>

<script lang="ts" setup>
const route = useRoute()
const slug = String(route.params.slug)

// Through Nitro, never Directus from the browser (ADR 0004): the route reads
// with the caller's own session, so an Author sees their draft here.
const { data: course, error } = await useFetch(`/api/courses/${slug}`, { key: `course:${slug}` })

// No readable Course is the site's 404, whatever the reason (missing or a
// draft: a visitor must not tell them apart), worded like Nuxt's own route
// miss. Anything else surfaces as the error it is. `fatal` makes a
// client-side navigation show the error page too, not only a server render.
if (error.value !== undefined) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    statusMessage:
      error.value.statusCode === 404 ? `Page not found: ${route.path}` : error.value.statusMessage,
    fatal: true,
  })
}

useHead({ title: () => course.value?.title ?? "Kurz" })
</script>

<style scoped>
.sales-page {
  --flow-space: var(--space-8);
}

.hero {
  display: grid;
  gap: var(--space-6);
  align-items: center;

  @media (--md-n-above) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

.cover {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-3);
}

.hero-body {
  --flow-space: var(--space-4);
}

.teaser {
  font-size: var(--font-size-1);
  color: var(--text-color-2);
}

.offer {
  --flow-space: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
}

.price {
  font-size: var(--font-size-3);
  color: var(--brand-color);
}
</style>
