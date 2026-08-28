<template>
  <PageWrapper class="live-course-page p-page-layout">
    <LiveCoursePromo
      grade-range="2.–5. třída"
      grade-from="2."
      grade-to="5."
      term="5. 10. 2026 – 8. 3. 2027"
      day-and-time="Pondělí 17:05–18:20"
      time-range="17:05 do 18:20"
      lessons-part1="5. 10., 19. 10., 2. 11., 23. 11. a 7. 12. 2026"
      lessons-part2="11. 1., 25. 1., 8. 2., 22. 2. a 8. 3. 2027"
      :capacity="10"
      order-url="https://www.stob.cz/cs/orderProcess/2940"
    />
  </PageWrapper>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Kurz zdravého (ne)hubnutí pro děti 2.–5. třída, Hradec Králové",
  description:
    "Kurz naživo pro děti 2.–5. třídy s nadváhou. 10 lekcí v Hradci Králové od 5. 10. 2026, vede Zdeňka Trummová. Bez diet, se zapojením rodičů.",
})
</script>

<style scoped>
.live-course-page {
  padding-bottom: var(--space-9);
}
</style>
