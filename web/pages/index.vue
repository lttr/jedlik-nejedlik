<template>
  <main class="main p-page-layout">
    <HeroSection />
    <LecturesSection class="p-full-end" />
    <IndividualSection />
    <ExpertsSection />
    <BlogSection />
    <TestimonialsSection />
    <AboutUsSection />
    <FaqSection class="p-inset-padded" />
    <ContactsSection />
  </main>
</template>

<script setup lang="ts"></script>

<style scoped>
.main {
  row-gap: var(--space-8);
}
</style>
