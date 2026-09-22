<template>
  <PageWrapper>
    <div class="p-flow">
      <h1>Kurzy</h1>

      <p v-if="error" class="notice" role="alert">
        Nabídku kurzů se teď nepodařilo načíst. Zkuste to prosím za&nbsp;chvíli.
      </p>
      <p v-else-if="courses.length === 0" class="notice">
        Zatím nenabízíme žádný kurz. Na&nbsp;prvním pracujeme, brzy ho tu najdete.
      </p>
      <ul v-else class="catalog p-auto-grid">
        <li v-for="course of courses" :key="course.id">
          <CatalogCourseCard :course />
        </li>
      </ul>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Kurzy",
  description: "Nabídka videokurzů Jedlík-nejedlík o výživě a výchově dětí.",
})

// Through Nitro, never Directus from the browser (ADR 0004): the route reads
// with the caller's own session, so an Author sees their drafts here.
const key = "catalog"
const { data: courses, error } = await useFetch("/api/courses", { key, default: () => [] })
watchAsyncDataError(key, error)

// Breadcrumbs and an item list of what the page shows (spec, "Metadata and
// structured data"). An Author's own drafts ride along in their session
// only; a crawler gets the published list.
useSchemaOrg(
  computed(() => [
    defineBreadcrumb({
      itemListElement: [{ name: "Domů", item: "/" }, { name: "Kurzy" }],
    }),
    defineItemList({
      itemListElement: courses.value.map((course) => ({
        name: course.title,
        item: `/kurzy/${course.slug}`,
      })),
    }),
  ]),
)

// The bespoke registry is checked here, the one place that already holds
// every Course slug, so the check costs no request. Development only: a
// production build drops the block with `import.meta.dev`.
if (import.meta.dev) {
  const orphans = orphanSalesContentSlugs(courses.value.map((course) => course.slug))
  if (orphans.length > 0) {
    console.warn(`[sales-content] registry keys with no Course behind them: ${orphans.join(", ")}`)
  }
}
</script>

<style scoped>
.catalog {
  --auto-grid-min: 18rem;
  /* auto-fill, not auto-fit: one course must not stretch across the row. */
  --auto-grid-repeat: auto-fill;
  --flow-space: var(--space-6);
  list-style-type: none;
  padding-inline-start: 0;
}

.notice {
  --flow-space: var(--space-6);
  max-width: var(--size-content-2);
}
</style>
