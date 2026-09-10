<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Mounted here, above the layouts, so one bar covers them both. Client-only
       because the decision lives in localStorage: a server-rendered bar would
       hydration-mismatch for everyone who already decided. -->
  <ClientOnly>
    <CookieConsentBar />
  </ClientOnly>
</template>

<script lang="ts" setup>
// nuxt-og-image is off (nuxt.config) and it was what made og:image absolute.
// nuxt-seo-utils emits the static `public/og-image.png` relative, which
// crawlers reject, so set the absolute one here.
const siteConfig = useSiteConfig()
const ogImage = new URL("/og-image.png", siteConfig.url).href

useSeoMeta({ ogImage, twitterImage: ogImage })
</script>
