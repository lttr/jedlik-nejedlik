<template>
  <a
    :href="LIVE_COURSES[courseId].buyUrl"
    @click="$trackMetaPixelEvent('InitiateCheckout', courseId)"
  >
    <slot />
  </a>
</template>

<script lang="ts" setup>
const { courseId } = defineProps<{ courseId: LiveCourseId }>()
</script>
