<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
// nuxt-og-image is disabled (see nuxt.config), and it was the module turning the
// og:image tag into an absolute URL. nuxt-seo-utils, which picks up the static
// `public/og-image.png`, emits it relative — crawlers reject that — so we set the
// absolute one here; it overrides the tag seo-utils adds at build time.
const siteConfig = useSiteConfig()
const ogImage = new URL("/og-image.png", siteConfig.url).href

useSeoMeta({ ogImage, twitterImage: ogImage })
</script>
