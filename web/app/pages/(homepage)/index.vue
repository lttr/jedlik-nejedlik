<template>
  <main class="main p-page-layout">
    <ChristmasCookieSection />
    <AboutProjectSection />
    <!-- <HeroSection /> -->
    <!-- <ParentsSection /> -->
    <!-- <LecturesSection class="p-full-end" /> -->
    <!-- <ExpertsSection /> -->
    <!-- <BlogSection /> -->
    <!-- <IndividualSection /> -->
    <!-- <TestimonialsSection /> -->
    <!-- <AboutUsSection /> -->
    <!-- <FaqSection class="p-inset-padded" /> -->
    <!-- <ContactsSection /> -->
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "homepage",
})
</script>

<style scoped>
.main {
  row-gap: var(--space-9);
  padding-bottom: var(--space-9);
}
</style>
