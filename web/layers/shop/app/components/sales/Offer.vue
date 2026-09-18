<template>
  <p v-if="course.price_czk !== undefined" class="offer">
    <strong v-if="!entitled" class="price">{{ formatPriceCzk(course.price_czk) }}</strong>

    <NuxtLink
      v-if="entitled"
      :to="`${MY_COURSES_PATH}#${MY_COURSES_ANCHOR}`"
      class="p-button p-button-brand"
      >Přejít do kurzu</NuxtLink
    >
    <NuxtLink v-else :to="`/objednavka/${course.slug}`" class="p-button p-button-brand"
      >Koupit kurz</NuxtLink
    >
  </p>
</template>

<script lang="ts" setup>
import type { Course } from "../../../../directus/shared/utils/schemas"
import { MY_COURSES_ANCHOR, MY_COURSES_PATH } from "../../../shared/utils/owned-courses"

// The Sales Page's one call to action, in its three states (spec,
// „Placement"): a Course without a price is unbuyable rather than free (user
// story 24), so it offers nothing at all; an owner is sent to „Moje kurzy"
// rather than invited to buy it twice (user story 20), and the price stops
// being an offer to them; everyone else is invited to buy.
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
