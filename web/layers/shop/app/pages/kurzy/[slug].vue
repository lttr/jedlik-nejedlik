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

// Head and structured data derive from the Course itself (spec, "Metadata
// and structured data"): no SEO fields on `course`. The site's title template
// and canonical link come from nuxt-seo-utils' defaults, so only what is
// specific to this Course is set here. The og:image is the cover at 1200×630;
// without a cover the site-wide one from `app.vue` stays. Getters, so a
// refetched Course updates the tags too.
const siteConfig = useSiteConfig()
const directusUrl = useRuntimeConfig().public.directusUrl
// Absolute on purpose: the Course resolver leaves `url` as given, unlike the
// breadcrumb and offer ones, and a crawler wants the canonical form.
const courseUrl = new URL(`/kurzy/${slug}`, siteConfig.url).href
const ogImage = (): string | undefined =>
  course.value?.cover ? courseOgImageUrl(directusUrl, course.value.cover.id) : undefined

useSeoMeta({
  title: () => course.value?.title ?? "Kurz",
  description: () => course.value?.description,
  ogTitle: () => course.value?.title,
  ogDescription: () => course.value?.description,
  ogImage,
  ogImageWidth: () => (ogImage() ? OG_IMAGE_WIDTH : undefined),
  ogImageHeight: () => (ogImage() ? OG_IMAGE_HEIGHT : undefined),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
})

// A Course entity with its offer, never a Product as well (spec). No identity
// is configured for schema.org, so the provider is the site itself, from the
// same site config that names it everywhere else.
useSchemaOrg(
  computed(() => {
    const current = course.value
    if (current === undefined) {
      return []
    }
    const imageUrl = ogImage()
    const image =
      imageUrl === undefined
        ? undefined
        : defineImage({ url: imageUrl, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT })
    const offers =
      current.price_czk === undefined
        ? undefined
        : defineOffer({
            price: current.price_czk,
            priceCurrency: "CZK",
            url: courseUrl,
            availability: "InStock",
          })
    return [
      defineCourse({
        name: current.title,
        description: current.description ?? "",
        url: courseUrl,
        image,
        provider: { name: siteConfig.name, url: siteConfig.url },
        offers,
      }),
      defineBreadcrumb({
        itemListElement: [
          { name: "Domů", item: "/" },
          { name: "Kurzy", item: "/kurzy" },
          { name: current.title },
        ],
      }),
    ]
  }),
)
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
