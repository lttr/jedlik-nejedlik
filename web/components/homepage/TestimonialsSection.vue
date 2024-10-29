<template>
  <PageSection class="testimonials p-stack">
    <h2>Reference</h2>
    <div class="wrapper p-auto-grid">
      <Testimonial v-bind="exampleTestimonial" />
      <Testimonial v-bind="exampleTestimonial" />
    </div>
    <SvgoBoruvky class="boruvky" />
  </PageSection>
</template>

<script lang="ts" setup>
const exampleTestimonial = {
  stars: 5,
  text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam id dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Aliquam erat volutpat.",
  author: "Jana, máma 2 měsičního nejedlíka Jonáše",
}
</script>

<style scoped>
.testimonials {
  position: relative;
}

.wrapper {
  --auto-grid-min: var(--size-content-1);
}

.boruvky {
  z-index: -1;
  position: absolute;
  width: 10rem;
  bottom: 3rem;
  left: -4rem;
}
</style>
