<template>
  <p v-if="course.price_czk !== undefined" class="offer">
    <strong v-if="!entitled" class="price">{{ formatPriceCzk(course.price_czk) }}</strong>

    <NuxtLink
      v-if="entitled"
      :to="`${MY_COURSES_PATH}#${MY_COURSES_ANCHOR}`"
      class="p-button p-button-brand"
      >Přejít do kurzu</NuxtLink
    >
    <NuxtLink v-else :to="checkoutPath(course.slug)" class="p-button p-button-brand"
      >Koupit kurz</NuxtLink
    >
  </p>
</template>

<script lang="ts" setup>
import type { Course } from "#layers/directus/shared/utils/schemas"
import { MY_COURSES_ANCHOR, MY_COURSES_PATH } from "#layers/shop/shared/utils/owned-courses"
import { checkoutPath } from "#layers/base/shared/utils/pending-checkout"
import { formatPriceCzk } from "#layers/shop/shared/utils/price"

// The Sales Page's one call to action, in three states. `entitled` is the
// caller's own Entitlement as the Sales Page's Nitro route read it — the
// browser never decides this. See docs/shop.md, „Sales Page".
defineProps<{
  course: Course
  entitled: boolean
}>()
</script>

<style scoped>
.offer {
  --flow-space: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
}

.price {
  font-size: var(--font-size-3);
  color: var(--brand-color);
}
</style>
