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
import type { Course } from "../../../../directus/shared/utils/schemas"
import { MY_COURSES_ANCHOR, MY_COURSES_PATH } from "../../../shared/utils/owned-courses"
import { checkoutPath } from "../../../shared/utils/pending-checkout"

// The Sales Page's one call to action, in three states (spec, „Placement"):
//
// - no price: the Course is unbuyable rather than free, so nothing is offered
//   at all (user story 24);
// - `entitled`: the owner is sent to „Moje kurzy" instead of being invited to
//   buy twice, and the price stops being an offer to them (user story 20);
// - otherwise: the invitation to buy.
//
// `entitled` is the caller's own Entitlement as the Sales Page's Nitro route
// read it — the browser never decides this.
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
