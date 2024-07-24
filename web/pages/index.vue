<template>
  <div>
    <Header class="p-page-layout" />
    <main class="main p-page-layout p-stack">
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
    <Footer class="p-page-layout p-full" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.main {
  --stack-space: var(--space-8);
}
</style>
