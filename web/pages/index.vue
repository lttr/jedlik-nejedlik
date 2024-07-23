<template>
  <div>
    <header class="p-page-layout">
      <div class="top-line p-secondary-text-regular p-content">
        <Icon name="uil:facebook" />
        <Icon name="uil:instagram" />
        <span>#jedliknejedlik</span>
      </div>

      <MainNav class="p-full" />
    </header>
    <main class="main p-page-layout p-stack">
      <HeroSection />
      <LecturesSection class="p-full-end" />
      <IndividualSection />
      <ExpertsSection />
      <BlogSection />
      <TestimonialsSection />
      <AboutUsSection />
    </main>
    <footer></footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.top-line {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-3);
}

.main {
  --stack-space: var(--space-8);
}
</style>
