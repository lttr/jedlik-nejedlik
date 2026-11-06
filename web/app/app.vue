<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Mounted here, above the layouts, so one instance covers them both.
       Client-only because their state lives in localStorage: a server-rendered
       bar would hydration-mismatch for everyone who already decided. -->
  <ClientOnly>
    <CookieConsentBar />
    <EbookBanner />
  </ClientOnly>
</template>

<script lang="ts" setup>
import { SITE_URL } from "#layers/base/shared/utils/site"

import CookieConsentBar from "./components/CookieConsentBar.vue"
import EbookBanner from "./components/EbookBanner.vue"

// nuxt-og-image is off (nuxt.config) and it was what made og:image absolute.
// nuxt-seo-utils emits the static `public/og-image.png` relative, which
// crawlers reject, so set the absolute one here.
const ogImage = new URL("/og-image.png", SITE_URL).href

useSeoMeta({ ogImage, twitterImage: ogImage })
</script>
