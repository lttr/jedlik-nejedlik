<template>
  <div class="recap p-flow">
    <CourseCover v-if="course.cover" class="cover" :image="course.cover" sizes="90vw md:320px" />
    <p class="muted">Objednávka kurzu</p>
    <strong>{{ course.title }}</strong>
    <p class="price">{{ formatPriceCzk(course.price_czk) }}</p>
    <ul class="delivery muted">
      <li>Přístup ihned po&nbsp;zaplacení, bez&nbsp;časového omezení.</li>
      <li>Videa sledujete v&nbsp;prohlížeči na&nbsp;počítači, tabletu i&nbsp;telefonu.</li>
      <li>Kurz se nestahuje, zůstává vám na&nbsp;webu.</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { SellableCourse } from "../../../shared/utils/checkout"

// What is being bought, alongside the steps the whole way down — the point of
// buying on the Course's own page rather than on a login form (spec, user
// story 6). The delivery copy is static: it is the same for every On-demand
// Course this area sells.
const { course } = defineProps<{ course: SellableCourse }>()
</script>

<style scoped>
.recap {
  --flow-space: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-3);
}

.cover {
  --flow-space: 0;
  margin-block-end: var(--space-4);
  border-radius: var(--radius-2);
}

.muted {
  color: var(--text-color-2);
  font-size: var(--font-size-0);
}

.price {
  font-size: var(--font-size-3);
  color: var(--brand-color);
}

.delivery {
  --flow-space: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  /* The stylesheet drops list markers site-wide, so an indent would only leave
     the lines hanging off the rest of the recap. */
  padding-inline-start: 0;
}
</style>
