<template>
  <PageWrapper>
    <header class="page-header">
      <h1>Konzultace pro děti</h1>
      <p class="lead">
        Pomáháme rodinám s&nbsp;dětmi, které se potýkají s&nbsp;nadváhou či obezitou. Pracujeme bez
        diet, bez strašení a&nbsp;s&nbsp;respektem k&nbsp;dítěti i&nbsp;celé rodině.
      </p>
    </header>

    <section class="pricing-section" aria-labelledby="pricing-title">
      <h2 id="pricing-title" class="pricing-section__title">Ceník konzultací</h2>
      <dl class="pricing-list">
        <div class="pricing-row">
          <dt>Úvodní konzultace dětské nadváhy či obezity</dt>
          <dd>1&nbsp;000&nbsp;Kč&nbsp;/&nbsp;60&nbsp;minut</dd>
        </div>
        <div class="pricing-row">
          <dt>Následná konzultace</dt>
          <dd>500&nbsp;Kč&nbsp;/&nbsp;60&nbsp;minut</dd>
        </div>
      </dl>
    </section>

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

/* Pricing */
.pricing-section {
  max-width: 36rem;
  margin: var(--space-5) auto;
  padding: var(--space-5) var(--space-6);
  background: var(--color-peach);
  border-radius: var(--radius-4);

  @media (--sm-n-below) {
    padding: var(--space-5) var(--space-4);
    border-radius: var(--radius-0);
  }
}

.pricing-section__title {
  text-align: center;
  font-size: var(--font-size-3);
  margin-bottom: var(--space-3);
}

.pricing-list {
  margin: 0;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgb(10 26 87 / 0.12);

  @media (--sm-n-below) {
    flex-direction: column;
    gap: var(--space-1);
  }
}

.pricing-row:last-child {
  border-bottom: none;
}

.pricing-row dt {
  color: var(--text-2);
}

.pricing-row dd {
  margin: 0;
  font-weight: var(--font-weight-7);
  white-space: nowrap;
}

.consultation-form-section {
  max-width: var(--size-content-3);
  margin-inline: auto;
  padding: var(--space-5) var(--space-4) var(--space-6);
}
</style>
