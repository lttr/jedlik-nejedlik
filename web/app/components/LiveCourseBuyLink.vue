<template>
  <a
    :href="LIVE_COURSES[courseId].buyUrl"
    @click="$trackMetaPixelEvent('InitiateCheckout', courseId)"
  >
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { LIVE_COURSES } from "../utils/live-courses"
import type { LiveCourseId } from "../utils/live-courses"

const { courseId } = defineProps<{ courseId: LiveCourseId }>()
</script>
