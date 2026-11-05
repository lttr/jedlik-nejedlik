<template>
  <div class="age-tabs">
    <div class="tab-list" role="tablist" aria-label="Věk dítěte">
      <button
        v-for="(tip, index) of AGE_TIPS"
        :id="`age-tab-${index}`"
        :key="tip.label"
        ref="tabButtons"
        type="button"
        role="tab"
        class="tab"
        :aria-selected="index === activeIndex"
        :aria-controls="`age-panel-${index}`"
        :tabindex="index === activeIndex ? 0 : -1"
        @click="activeIndex = index"
        @keydown="onKeydown"
      >
        {{ tip.label }}
      </button>
    </div>
    <div
      v-for="(tip, index) of AGE_TIPS"
      v-show="index === activeIndex"
      :id="`age-panel-${index}`"
      :key="tip.label"
      class="tab-panel"
      role="tabpanel"
      :aria-labelledby="`age-tab-${index}`"
      tabindex="0"
    >
      <p class="panel-title">{{ tip.title }}</p>
      <ul class="panel-list">
        <li v-for="item of tip.items" :key="item">
          <CheckMark class="check" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckMark from "./CheckMark.vue"
import { AGE_TIPS } from "./content"

const activeIndex = ref(0)
const tabButtons = useTemplateRef<HTMLButtonElement[]>("tabButtons")

/** Arrow keys, Home and End move between tabs, per the WAI-ARIA tabs pattern. */
function onKeydown(event: KeyboardEvent) {
  const last = AGE_TIPS.length - 1
  const next = {
    ArrowRight: activeIndex.value === last ? 0 : activeIndex.value + 1,
    ArrowLeft: activeIndex.value === 0 ? last : activeIndex.value - 1,
    Home: 0,
    End: last,
  }[event.key]
  if (next === undefined) {
    return
  }
  event.preventDefault()
  activeIndex.value = next
  tabButtons.value?.[next]?.focus()
}
</script>

<style scoped>
.tab-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tab {
  min-height: 3rem;
  padding-inline: var(--space-4);
  border: 0;
  border-radius: var(--radius-round);
  background-color: rgb(255 255 255 / 12%);
  color: white;
  font: inherit;
  font-weight: var(--font-weight-6);
  box-shadow: none;
  cursor: pointer;

  &:hover {
    background-color: rgb(255 255 255 / 22%);
  }

  &[aria-selected="true"] {
    background-color: var(--color-light-lime);
    color: var(--color-navy);
  }

  &:focus-visible {
    outline: 3px solid var(--color-star);
    outline-offset: 2px;
  }
}

.tab-panel {
  margin-top: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-3);
  background-color: rgb(255 255 255 / 8%);

  &:focus-visible {
    outline: 3px solid var(--color-star);
    outline-offset: 2px;
  }
}

.panel-title {
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
}

.panel-list {
  list-style: none;
  padding: 0;
  margin-top: var(--space-3);

  li {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    padding-block: var(--space-2);
  }

  .check {
    color: var(--color-light-lime);
  }
}
</style>
