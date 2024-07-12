<template>
  <div>
    <header>
      <div class="top-line p-secondary-text-regular p-container">
        <Icon name="uil:facebook" />
        <Icon name="uil:instagram" />
        <span>#jedliknejedlik</span>
      </div>

      <MainNav />
    </header>
    <main class="p-stack">
      <HeroSection />
      <section>
        <h2>Neco</h2>
      </section>
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
</style>
