<template>
  <PageWrapper class="live-course-page p-page-layout">
    <LiveCoursePromo
      grade-range="6.–9. třída"
      grade-from="6."
      grade-to="9."
      term="22. 9. 2026 – 23. 2. 2027"
      day-and-time="Úterý 17:05–18:20"
      time-range="17:05 do 18:20"
      lessons-part1="22. 9., 6. 10., 20. 10., 3. 11. a 10. 11. 2026"
      lessons-part2="5. 1., 19. 1., 2. 2., 16. 2. a 23. 2. 2027"
      :capacity="8"
      order-url="https://www.stob.cz/cs/orderProcess/2922"
    />
  </PageWrapper>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Kurz zdravého (ne)hubnutí pro děti 6.–9. třída, Hradec Králové",
  description:
    "Kurz naživo pro děti 6.–9. třídy s nadváhou. 10 lekcí v Hradci Králové od 22. 9. 2026, vede Zdeňka Trummová. Bez diet, se zapojením rodičů.",
})
</script>

<style scoped>
.live-course-page {
  padding-bottom: var(--space-9);
}
</style>
