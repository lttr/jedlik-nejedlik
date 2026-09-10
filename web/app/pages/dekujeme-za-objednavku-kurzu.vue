<template>
  <ThankYouPage :title="course ? course.name : GENERIC_TITLE">
    <template v-if="course">
      <p class="lead">Platba proběhla úspěšně a Vaše přihláška je potvrzená.</p>
      <p>
        Kurz začíná <strong>{{ course.startDate }}</strong
        >.
      </p>
    </template>
    <p v-else class="lead">Platba proběhla úspěšně.</p>
    <p>Potvrzení přihlášky i doklad o zaplacení Vám dorazí e-mailem.</p>

    <template #action>
      <NuxtLink to="/" class="p-button p-button-brand">Zpět na úvodní stránku</NuxtLink>
    </template>
  </ThankYouPage>
</template>

<script lang="ts" setup>
/**
 * Where SimpleShop sends a Live Course buyer after payment ("URL po uhrazení"),
 * one page for all three products: the static `kurz` query parameter says which
 * one was bought. It replaces SimpleShop's own post-payment page, so it has to
 * state that the confirmation and the doklad arrive by e-mail.
 */

/** Shown when `kurz` names no course we sell — the buyer still paid for something. */
const GENERIC_TITLE = "Děkujeme za Vaši objednávku"

const kurz = useRoute().query.kurz
// An unknown or missing `kurz` is not an error: the page shows generic copy and
// the event goes out without a course id.
const courseId = isLiveCourseId(kurz) ? kurz : undefined
const course = courseId ? LIVE_COURSES[courseId] : undefined

const { $trackMetaPixelEvent } = useNuxtApp()

onMounted(() => {
  $trackMetaPixelEvent("Purchase", courseId, { once: true })
})

useSeoMeta({
  title: course ? `Děkujeme za objednávku – ${course.name}` : GENERIC_TITLE,
  description: "Potvrzení objednávky kurzu Jedlík-nejedlík.",
})
</script>
