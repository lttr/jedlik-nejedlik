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
          <!-- Until area 06 ships the player there is nowhere to send them,
               so the card says so rather than offering a dead link. -->
          <p class="muted">Kurz se připravuje</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import { MY_COURSES_ANCHOR } from "../../../shared/utils/owned-courses"
import type { OwnedCourse } from "../../../shared/utils/owned-courses"

// „Moje kurzy" on the Account page (spec, user story 19). A shop-layer
// component that the auth layer's `/muj-ucet` includes, because the list and
// its route are shop code and the page is not.
//
// Through Nitro, never Directus from the browser (ADR 0004). No `error`
// branch for a missing session: the page is behind the auth middleware, so an
// anonymous visitor is at the login page long before this runs.
const { data: courses, error } = await useFetch<OwnedCourse[]>("/api/account/courses", {
  key: "account:courses",
  // A failure is its own branch below; the list itself is never null, so the
  // template never has to ask.
  default: () => [],
})

// One sentence for every failure: nothing here is the Student's doing and
// there is nothing for them to correct.
const errorMessage = computed(() =>
  error.value === undefined
    ? ""
    : "Seznam kurzů se teď nepodařilo načíst. Zkuste to prosím za chvíli.",
)
</script>

<style scoped>
/* The panel's own flow does not reach inside a section, so the heading and
   the list space themselves. */
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
