<template>
  <a
    :href="LIVE_COURSES[courseId].buyUrl"
    @click="$trackMetaPixelEvent('InitiateCheckout', courseId)"
  >
    <slot />
  </a>
</template>

<script lang="ts" setup>
// Every Live Course buy button goes through here, so a new one cannot ship
// without its InitiateCheckout. Classes, `target` and `rel` fall through from
// the surface that places the button.
const { courseId } = defineProps<{ courseId: LiveCourseId }>()
</script>
