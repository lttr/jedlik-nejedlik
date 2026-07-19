<template>
  <component
    :is="course.owned ? NuxtLink : 'div'"
    :to="course.owned ? `/kurzy/${course.id}` : undefined"
    class="course-card"
    :class="[`course-card--${course.accent}`, { 'is-locked': !course.owned }]"
  >
    <div class="thumb">
      <span class="badge">{{ course.owned ? "Zakoupeno" : "V nabídce" }}</span>
    </div>
    <div class="body">
      <h3>{{ course.title }}</h3>
      <p>{{ course.subtitle }}</p>
      <div class="meta">
        <span>⏱ {{ course.duration }}</span>
        <span v-if="course.owned" class="access">✓ Přístup</span>
        <span v-else>Nejdřív nákup</span>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { Course } from "../composables/useLms"

// `<component :is="'NuxtLink'">` (string) nezrezolvuje na komponentu v produkčním
// buildu a vyrenderuje se prázdný <nuxtlink> bez href. Musíme předat samotnou komponentu.
const NuxtLink = resolveComponent("NuxtLink")

defineProps<{ course: Course }>()
</script>

<style scoped>
.course-card {
  display: block;
  overflow: hidden;
  border-radius: var(--radius-4);
  background: var(--surface-1, white);
  border: 1px solid var(--color-peach);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.course-card:not(.is-locked):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.08);
}

.course-card.is-locked {
  opacity: 0.75;
}

.thumb {
  position: relative;
  height: 7rem;
  background: var(--color-peach);
}

.course-card--lime .thumb {
  background: var(--color-light-lime);
}

.badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
  background: white;
  color: var(--brand-color);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-round);
}

.body {
  padding: var(--space-4);
}

.body h3 {
  margin: 0 0 var(--space-1);
  font-size: var(--font-size-2);
  color: var(--brand-color);
}

.body p {
  margin: 0;
  color: var(--text-2);
  font-size: var(--font-size--1);
}

.meta {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
  font-size: var(--font-size--1);
  color: var(--text-2);
}

.access {
  color: var(--color-forest-green);
  font-weight: var(--font-weight-6);
}
</style>
