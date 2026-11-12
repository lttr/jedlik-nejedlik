<template>
  <ol class="timeline">
    <li v-for="block of program" :key="block.time" :class="{ 'is-break': block.isBreak }">
      <span class="timeline-time">{{ block.time }}</span>
      <div class="timeline-body">
        <p class="timeline-title">
          <Icon v-if="block.isBreak" name="uil:coffee" />
          {{ block.title }}
        </p>
        <p v-if="block.description">{{ block.description }}</p>
      </div>
    </li>
  </ol>
</template>

<script lang="ts" setup>
export interface ProgramBlock {
  time: string
  title: string
  description?: string
  isBreak?: boolean
}

const { program } = defineProps<{
  program: ProgramBlock[]
}>()
</script>

<style scoped>
.timeline {
  --timeline-accent: var(--accent, var(--color-forest-green));

  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;

  & li {
    display: grid;
    grid-template-columns: 11ch 1fr;
    gap: var(--space-4);
    padding-block: var(--space-4);
    border-bottom: 1px solid var(--surface-3);

    @media (--sm-n-below) {
      grid-template-columns: 1fr;
      gap: var(--space-1);
    }
  }

  & .is-break {
    padding-block: var(--space-2);
    color: var(--text-2);
  }
}

.timeline-time {
  font-weight: var(--font-weight-6);
  font-variant-numeric: tabular-nums;
  color: var(--timeline-accent);
}

.timeline-body {
  display: grid;
  gap: var(--space-1);

  & p {
    margin: 0;
  }
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-6);
}

.is-break .timeline-title {
  font-weight: var(--font-weight-4);
}
</style>
