<template>
  <PageWrapper class="online-kurz-page p-page-layout">
    <ObesityCoursePromo />
  </PageWrapper>
</template>

<script lang="ts" setup>
import ObesityCoursePromo from "../components/ObesityCoursePromo.vue"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"

useSeoMeta({
  title: "Online kurz pro rodiče dětí s nadváhou",
  description:
    "Pomozte svému dítěti znovu najít rovnováhu. Online kurz pro rodiče dětí s nadváhou a obezitou ve věku 3–7 let. Start: 11. ledna 2027.",
})
</script>

<style scoped>
.online-kurz-page {
  padding-bottom: var(--space-9);
}
</style>
