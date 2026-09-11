<template>
  <PageWrapper class="live-course-page p-page-layout">
    <LiveCoursePromo
      grade-range="6.–9. třída"
      grade-from="6."
      grade-to="9."
      term="22.&nbsp;9.&nbsp;2026 – 23.&nbsp;2.&nbsp;2027"
      day-and-time="Úterý 17:05–18:20"
      time-range="17:05 do 18:20"
      lessons-part1="22.&nbsp;9., 6.&nbsp;10., 20.&nbsp;10., 3.&nbsp;11. a&nbsp;10.&nbsp;11. 2026"
      lessons-part2="5.&nbsp;1., 19.&nbsp;1., 2.&nbsp;2., 16.&nbsp;2. a&nbsp;23.&nbsp;2. 2027"
      :capacity="10"
      course-id="nazivo-6-9-hk-2026-09"
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
