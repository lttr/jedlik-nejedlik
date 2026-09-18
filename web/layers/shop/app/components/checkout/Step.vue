<template>
  <section class="step" :class="{ done, locked }">
    <h2>
      <span class="num" aria-hidden="true">{{ done ? "✓" : number }}</span
      >{{ title }}
    </h2>
    <slot />
  </section>
</template>

<script lang="ts" setup>
// One of the Checkout's three numbered boxes (prototype, variant C). A step is
// `done` (its number becomes a tick) or `locked` (a visitor without an Account
// sees what steps 2 and 3 will ask for, greyed out) or neither.
const {
  number,
  title,
  done = false,
  locked = false,
} = defineProps<{
  number: number
  title: string
  done?: boolean
  locked?: boolean
}>()
</script>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-3);
}

.step.done,
.step.locked {
  opacity: 0.75;
}

h2 {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin: 0;
  font-size: var(--font-size-2);
}

.num {
  display: inline-grid;
  place-items: center;
  inline-size: 1.8rem;
  block-size: 1.8rem;
  border-radius: 50%;
  background: var(--brand-color);
  color: var(--surface-1);
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
}

.step.done .num {
  background: var(--text-color-1);
}

.step.locked .num {
  background: var(--text-color-2);
}
</style>
