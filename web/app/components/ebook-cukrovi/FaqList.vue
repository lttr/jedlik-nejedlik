<template>
  <div class="faq-list">
    <details v-for="(item, index) of FAQ" :key="item.question" class="faq-item" :open="index === 0">
      <summary class="faq-question">
        <span>{{ item.question }}</span>
        <span class="faq-toggle" aria-hidden="true"><Icon name="bi:plus-lg" /></span>
      </summary>
      <p class="faq-answer">{{ item.answer }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
import { FAQ } from "./content"
</script>

<style scoped>
.faq-list {
  border-top: 1px solid var(--surface-3);
}

/* Resets Puleo's pill-shaped details and summary. */
.faq-item {
  padding: 0;
  border-bottom: 1px solid var(--surface-3);
  border-radius: 0;
  background: none;

  &[open] .faq-toggle {
    transform: rotate(45deg);
  }
}

.faq-question {
  margin: 0;
  padding-inline: 0;
  border-radius: 0;
  background: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  min-height: 4.5rem;
  padding-block: var(--space-3);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    color: var(--color-burgundy-red);
  }

  &:focus-visible {
    outline: 3px solid var(--color-navy);
    outline-offset: 2px;
  }
}

.faq-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-round);
  background-color: var(--color-peach);
  transition: transform 0.15s ease;
}

.faq-answer {
  padding-bottom: var(--space-5);
  padding-right: var(--space-8);
  color: var(--text-color-2);

  @media (--md-n-below) {
    padding-right: 0;
  }
}
</style>
