<template>
  <PageWrapper>
    <header class="page-header">
      <h1>Konzultace pro děti</h1>
      <p class="lead">
        Pomáháme rodinám s&nbsp;dětmi, které se potýkají s&nbsp;nadváhou či
        obezitou. Pracujeme bez diet, bez strašení a&nbsp;s&nbsp;respektem
        k&nbsp;dítěti i&nbsp;celé rodině.
      </p>
    </header>

    <section class="consultation-form-section">
      <ConsultationForm />
    </section>
  </PageWrapper>
</template>

<script lang="ts" setup></script>

<style scoped>
.page-header {
  text-align: center;
  padding: var(--space-6) var(--space-4) var(--space-4);
  max-width: var(--size-content-3);
  margin-inline: auto;
}

.page-header h1 {
  margin-bottom: var(--space-2);
}

.page-header .lead {
  font-size: var(--font-size-2);
  color: var(--text-2);
  margin: 0;
}

.consultation-form-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-6) var(--space-4);
}
</style>
