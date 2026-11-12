<template>
  <section class="media-strip p-full-bg" :aria-label="label">
    <div class="media-row">
      <span class="media-label">{{ label }}</span>
      <ul class="media-list">
        <li v-for="outlet of MEDIA_OUTLETS" :key="outlet.name">
          <a :href="outlet.href" target="_blank" rel="noopener">{{ outlet.name }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { MEDIA_OUTLETS } from "./media-outlets"

const { label } = defineProps<{ label: string }>()
</script>

<style scoped>
.media-strip {
  padding-block: var(--space-6);
  border-bottom: 1px solid var(--surface-2);
}

.media-row,
.media-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2) var(--space-7);
}

.media-label {
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-navy) 72%, white);
}

.media-list {
  padding: 0;
  list-style: none;

  @media (--md-n-below) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3) var(--space-4);
    width: 100%;
    text-align: center;

    a {
      font-size: var(--font-size-0);
    }
  }

  a {
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-7);
    color: var(--color-navy);
    text-decoration: none;
    white-space: nowrap;
    opacity: 0.75;

    &:hover {
      opacity: 1;
      text-decoration: underline;
    }
  }
}
</style>
