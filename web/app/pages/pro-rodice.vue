<template>
  <PageWrapper class="pro-rodice">
    <!-- Page Header -->
    <header class="page-header">
      <h1>Pro rodiče</h1>
      <p>Pomáháme rodičům najít cestu k vyváženému vztahu dětí k jídlu</p>
    </header>

    <!-- Navigation Links Section -->
    <nav class="topic-nav">
      <NuxtLink to="/nejedlik" class="topic-link topic-link--star"> Máte doma nejedlíka </NuxtLink>
      <NuxtLink to="/nadvaha" class="topic-link topic-link--blue">
        Moje dítě má nadváhu/obezitu
      </NuxtLink>
      <NuxtLink to="/prevence" class="topic-link topic-link--lime">
        Téma mě zajímá preventivně
      </NuxtLink>
    </nav>

    <!-- Newsletter Section -->
    <section class="newsletter">
      <NewsletterForm />
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup>
import NewsletterForm from "../components/NewsletterForm.vue"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"
</script>

<style scoped>
/* Page Header */
.page-header {
  text-align: center;
  padding: var(--space-6) var(--space-4) var(--space-4);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.page-header h1 {
  margin-bottom: var(--space-2);
}

.page-header p {
  color: var(--text-color-2);
  margin: 0;
}

/* Topic Navigation */
.topic-nav {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-4);
  justify-content: center;
  align-items: center;

  @media (max-width: 50rem) {
    flex-direction: column;
  }
}

.topic-link {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 20ch;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-4);
  text-decoration: none;
  font-weight: var(--font-weight-5);
  font-size: var(--font-size-0);
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  }
}

.topic-link--star {
  background: var(--color-star);
  color: var(--color-navy);
}

.topic-link--blue {
  background: var(--color-pale-blue);
  color: var(--color-navy);
}

.topic-link--lime {
  background: var(--color-light-lime);
  color: var(--color-forest-green);
}

/* Newsletter Section */
.newsletter {
  margin-top: var(--space-8);
  max-width: var(--size-content-3);
  margin-inline: auto;
}
</style>
