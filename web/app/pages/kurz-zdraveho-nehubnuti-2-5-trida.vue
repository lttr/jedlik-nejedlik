<template>
  <PageWrapper class="live-course-page p-page-layout">
    <LiveCoursePromo
      grade-range="2.–5. třída"
      grade-from="2."
      grade-to="5."
      term="5.&nbsp;10.&nbsp;2026 – 8.&nbsp;3.&nbsp;2027"
      day-and-time="Pondělí 17:05–18:20"
      time-range="17:05 do 18:20"
      lessons-part1="5.&nbsp;10., 19.&nbsp;10., 2.&nbsp;11., 23.&nbsp;11. a&nbsp;7.&nbsp;12. 2026"
      lessons-part2="11.&nbsp;1., 25.&nbsp;1., 8.&nbsp;2., 22.&nbsp;2. a&nbsp;8.&nbsp;3. 2027"
      :capacity="10"
      course-id="nazivo-2-5-hk-2026-10"
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
