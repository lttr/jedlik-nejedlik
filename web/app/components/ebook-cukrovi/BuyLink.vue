<template>
  <a
    :href="PURCHASE_URL"
    class="buy-link"
    :class="[size, { cream }]"
    @click="$trackMetaPixelEvent('InitiateCheckout', EBOOK_ID)"
  >
    Chci e-book za {{ PRICE }}
  </a>
</template>

<script setup lang="ts">
import { EBOOK_ID, PRICE, PURCHASE_URL } from "./content"

const { size = "default", cream = false } = defineProps<{
  size?: "small" | "default" | "big"
  /** For dark backgrounds. */
  cream?: boolean
}>()
</script>

<style scoped>
.buy-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding-inline: var(--space-6);
  border-radius: var(--radius-round);
  background-color: var(--color-brick-red);
  color: white;
  font-size: 1rem;
  font-weight: var(--font-weight-6);
  text-align: center;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--color-brick-red-dark);
    color: white;
  }

  &:focus-visible {
    outline: 3px solid var(--color-navy);
    outline-offset: 3px;
  }
}

.small {
  min-height: 3rem;
  padding-inline: var(--space-4);
  font-size: 0.9375rem;
}

.big {
  min-height: 3.75rem;
  padding-inline: var(--space-7);
  font-size: 1.125rem;

  @media (--sm-n-below) {
    padding-inline: var(--space-5);
  }
}

.cream {
  background-color: var(--color-peach);
  color: var(--color-navy);

  &:hover {
    background-color: white;
    color: var(--color-navy);
  }

  &:focus-visible {
    outline-color: var(--color-star);
  }
}
</style>
