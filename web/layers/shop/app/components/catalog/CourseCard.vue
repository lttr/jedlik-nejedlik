<template>
  <NuxtLink :to="`/kurzy/${course.slug}`" class="course-card">
    <CourseCover v-if="course.cover" :image="course.cover" sizes="90vw sm:480px" loading="lazy" />
    <div class="body p-flow">
      <!-- Only an Author's own session ever carries a draft here (ADR 0004);
           the card marks it and otherwise treats it like any other Course,
           sort position included. -->
      <span v-if="course.status === 'draft'" class="draft-badge">Koncept</span>
      <h2 class="title">{{ course.title }}</h2>
      <p v-if="course.description" class="teaser">{{ course.description }}</p>
      <p class="meta">
        <strong v-if="course.price_czk !== undefined" class="price">
          {{ formatPriceCzk(course.price_czk) }}
        </strong>
        <span class="lessons">{{ formatLessonCount(course.lessonCount) }}</span>
      </p>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  course: CatalogCourse
}>()
</script>

<style scoped>
.course-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-peach);
  border-radius: var(--radius-3);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  }
}

.body {
  --flow-space: var(--space-2);
  padding: var(--space-5);
}

.draft-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-round);
  background: var(--brand-color);
  color: var(--text-color-1-inverse);
  font-size: var(--font-size--2);
  font-weight: var(--font-weight-label);
  line-height: 1.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title {
  font-size: var(--font-size-2);
  color: var(--brand-color);
}

.teaser {
  color: var(--text-color-2);
}

.meta {
  --flow-space: var(--space-4);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2);
  align-items: baseline;
}

.price {
  font-size: var(--font-size-2);
  color: var(--brand-color);
}

.lessons {
  font-size: var(--font-size--1);
  color: var(--text-color-2);
}
</style>
