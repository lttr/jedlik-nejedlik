<template>
  <div class="cover" :class="{ small }" aria-hidden="true">
    <span class="cover-tag">e-book</span>
    <p class="cover-title">Cukroví s&nbsp;dětmi a&nbsp;v&nbsp;pohodě</p>
    <template v-if="!small">
      <p class="cover-subtitle">Rodičovský průvodce vánočním mlsáním bez výčitek</p>
      <SvgoCukroviOpt class="cover-art" />
      <p class="cover-author">Zdeňka Trummová · jedlík-nejedlík</p>
    </template>
  </div>
</template>

<script setup lang="ts">
const { small = false } = defineProps<{ small?: boolean }>()
</script>

<style scoped>
.cover {
  display: flex;
  flex-direction: column;
  aspect-ratio: 3 / 4;
  padding: 9% 8% 8% 13%;
  border-radius: 8px 18px 18px 8px;
  background-color: var(--color-burgundy-red);
  color: var(--color-peach);
  box-shadow:
    0 28px 50px rgb(10 26 87 / 28%),
    inset 10px 0 0 rgb(0 0 0 / 14%);
  transform: rotate(-4deg);
  overflow: hidden;
}

.cover-tag {
  align-self: flex-start;
  padding: 1px 10px;
  border: 1.5px solid currentcolor;
  border-radius: var(--radius-round);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cover-title {
  margin-top: var(--space-4);
  font-size: clamp(1.5rem, 6vw, 2.1rem);
  font-weight: var(--font-weight-7);
  line-height: 1.06;
}

.cover-subtitle {
  margin-top: var(--space-3);
  font-size: var(--font-size--1);
  line-height: 1.4;
}

.cover-art {
  width: 100%;
  height: auto;
  margin-top: auto;
}

.cover-author {
  margin-top: var(--space-3);
  font-size: 0.75rem;
}

.small {
  padding: 12% 10% 10% 15%;

  .cover-title {
    font-size: var(--font-size-0);
  }
}
</style>
