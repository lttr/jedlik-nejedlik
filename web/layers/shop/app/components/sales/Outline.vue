<template>
  <section class="outline p-flow">
    <h2>Obsah kurzu</h2>
    <ol class="sections p-flow">
      <li v-for="section of sections" :key="section.id" class="section">
        <h3>{{ section.title }}</h3>
        <ol class="lessons">
          <li v-for="lesson of section.lessons" :key="lesson.id" class="lesson">
            <Icon :name="LESSON_TYPES[lesson.type].icon" class="lesson-icon" aria-hidden="true" />
            <span class="visually-hidden">{{ LESSON_TYPES[lesson.type].label }}: </span>
            <span>{{ lesson.title }}</span>
          </li>
        </ol>
      </li>
    </ol>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  sections: SalesSection[]
}>()

// How a video and a text Lesson tell apart in the outline: an icon for the
// eye, a label for a screen reader. The icon set (`bi`) is one the build
// bundles, so nothing is fetched from the iconify API at runtime.
const LESSON_TYPES: Record<Lesson["type"], { icon: string; label: string }> = {
  video: { icon: "bi:play-circle-fill", label: "Video" },
  text: { icon: "bi:file-earmark-text", label: "Text" },
}
</script>

<style scoped>
.outline {
  --flow-space: var(--space-5);
  max-width: var(--size-content-2);
}

.sections {
  list-style-type: none;
  padding-inline-start: 0;
}

/* The gap above a section comes from `.sections`' flow; the gap under its
   heading is set outright, because a `p-flow` on the section would have one
   `--flow-space` govern both. */
.section {
  --flow-space: var(--space-6);
}

.lessons {
  margin-block-start: var(--space-3);
  list-style-type: none;
  padding-inline-start: 0;
}

.lesson {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  padding-block: var(--space-2);
  border-bottom: 1px solid var(--color-peach);
}

.lesson-icon {
  flex-shrink: 0;
  color: var(--brand-color);
  transform: translateY(0.15em);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
