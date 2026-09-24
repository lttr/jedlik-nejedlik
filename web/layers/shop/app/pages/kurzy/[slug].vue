<template>
  <PageWrapper>
    <article v-if="course" class="sales-page p-flow">
      <header class="hero">
        <CourseCover
          v-if="course.cover"
          class="cover"
          :image="course.cover"
          sizes="90vw md:640px"
          fetchpriority="high"
        />
        <div class="hero-body p-flow">
          <h1>{{ course.title }}</h1>
          <p v-if="course.description" class="teaser">{{ course.description }}</p>
          <SalesOffer :course :entitled />
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
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"
import { SITE_NAME, SITE_URL } from "#layers/base/shared/utils/site"
import CourseCover from "#layers/shop/app/components/CourseCover.vue"
import SalesBespoke from "#layers/shop/app/components/sales/Bespoke.vue"
import SalesOffer from "#layers/shop/app/components/sales/Offer.vue"
import SalesOutline from "#layers/shop/app/components/sales/Outline.vue"
import { throwPageError } from "#layers/shop/app/utils/page-error"
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  courseOgImageUrl,
} from "#layers/shop/shared/utils/og-image"

const route = useRoute()
const slug = String(route.params.slug)

// Through Nitro, never Directus from the browser (ADR 0004): the route reads
// with the caller's own session, so an Author sees their draft here and a
// Student is told whether this Course is already theirs.
const { data, error } = await useFetch(`/api/courses/${slug}`, { key: `course:${slug}` })

const course = computed(() => data.value?.course)
const entitled = computed(() => data.value?.entitled === true)

// No readable Course is the site's 404, whatever the reason (missing or a
// draft: a visitor must not tell them apart). Anything else surfaces as the
// error it is.
if (error.value !== undefined) {
  throwPageError(error.value, route.path)
}

// Head and structured data derive from the Course itself; there are no SEO
// fields on it. Without a cover the site-wide og:image from `app.vue` stays.
// Getters, so a refetched Course updates the tags too.
const directusUrl = useRuntimeConfig().public.directusUrl
// Absolute on purpose: the Course resolver leaves `url` as given, unlike the
// breadcrumb and offer ones, and a crawler wants the canonical form.
const courseUrl = new URL(`/kurzy/${slug}`, SITE_URL).href
// Computed, not a function: the same URL is asked for six times per head
// evaluation (og, twitter, both dimensions, the schema.org image), and it is
// only rebuilt when the Course itself changes.
const ogImage = computed(() =>
  course.value?.cover ? courseOgImageUrl(directusUrl, course.value.cover.id) : undefined,
)

useSeoMeta({
  title: () => course.value?.title ?? "Kurz",
  description: () => course.value?.description,
  ogTitle: () => course.value?.title,
  ogDescription: () => course.value?.description,
  ogImage: () => ogImage.value,
  ogImageWidth: () => (ogImage.value === undefined ? undefined : OG_IMAGE_WIDTH),
  ogImageHeight: () => (ogImage.value === undefined ? undefined : OG_IMAGE_HEIGHT),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterImage: () => ogImage.value,
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
    const imageUrl = ogImage.value
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
        provider: { name: SITE_NAME, url: SITE_URL },
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
  border-radius: var(--radius-3);
}

.hero-body {
  --flow-space: var(--space-4);
}

.teaser {
  font-size: var(--font-size-1);
  color: var(--text-color-2);
}
</style>
