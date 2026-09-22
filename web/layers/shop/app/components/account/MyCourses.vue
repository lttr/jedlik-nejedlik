<template>
  <section class="my-courses">
    <h2 :id="MY_COURSES_ANCHOR" class="p-heading-4">Moje kurzy</h2>

    <ShopNotice v-if="errorMessage" :message="errorMessage" />

    <p v-else-if="courses.length === 0" class="muted">
      Zatím tu žádný kurz nemáte.
      <NuxtLink to="/kurzy">Podívejte se na&nbsp;nabídku kurzů</NuxtLink>.
    </p>

    <ul v-else class="list">
      <li v-for="owned of courses" :key="owned.entitlementId" class="item">
        <CourseCover
          v-if="owned.course.cover"
          class="cover"
          :image="owned.course.cover"
          sizes="90vw sm:12rem"
          loading="lazy"
        />
        <div class="body">
          <strong>{{ owned.course.title }}</strong>
          <p class="muted">Kurz se připravuje</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import { MY_COURSES_ANCHOR } from "../../../shared/utils/owned-courses"
import type { OwnedCourse } from "../../../shared/utils/owned-courses"

// Through Nitro, never Directus from the browser (ADR 0004). No `error`
// branch for a missing session: the page is behind the auth middleware.
const { data: courses, error } = await useFetch<OwnedCourse[]>("/api/account/courses", {
  key: "account:courses",
  default: () => [],
})

const errorMessage = computed(() =>
  error.value === undefined
    ? ""
    : "Seznam kurzů se teď nepodařilo načíst. Zkuste to prosím za chvíli.",
)
</script>

<style scoped>
.my-courses {
  display: grid;
  gap: var(--space-4);
}

.my-courses h2,
.my-courses p {
  margin: 0;
}

.list {
  display: grid;
  gap: var(--space-4);
  /* The stylesheet drops list markers site-wide; the indent would only push
     the covers off the rest of the panel. */
  padding-inline-start: 0;
}

.item {
  display: grid;
  gap: var(--space-4);
  align-items: center;

  @media (--sm-n-above) {
    grid-template-columns: 12rem minmax(0, 1fr);
  }
}

.cover {
  border-radius: var(--radius-2);
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
</style>
