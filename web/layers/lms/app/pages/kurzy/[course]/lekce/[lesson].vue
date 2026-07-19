<template>
  <PageWrapper v-if="data" class="lms-lesson">
    <NuxtLink :to="`/kurzy/${data.course!.id}`" class="back">← Zpět na kurz</NuxtLink>
    <p class="crumb">{{ data.course!.title }} · {{ data.section.title }}</p>
    <h1>{{ data.lesson.title }}</h1>

    <div v-if="data.lesson.type === 'video'" class="video">
      <span class="play">▶</span>
      <span class="tag">🔒 Podepsané video · Cloudflare Stream (FP-7)</span>
    </div>
    <div v-else class="text-lesson">
      <p>Textová lekce. Zde by byl výukový text lekce.</p>
    </div>

    <div v-if="data.lesson.attachments?.length" class="attachments">
      <h2>Doplňkové materiály</h2>
      <a v-for="file in data.lesson.attachments" :key="file" href="#" class="attach" @click.prevent>
        📎 {{ file }}
      </a>
    </div>

    <div class="nav">
      <button class="p-button p-button-outline" @click="goPrev">← Předchozí</button>
      <button class="p-button p-button-brand" @click="completeAndNext">
        Označit jako dokončené a pokračovat →
      </button>
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "lms-auth", layout: "lms" })

const route = useRoute()
const { getLesson, completeLesson } = useLms()

const courseId = route.params.course as string
const data = computed(() => getLesson(courseId, route.params.lesson as string))

// Index aktuální lekce v rámci sekce — pro navigaci mezi lekcemi.
const lessonIndex = computed(() => {
  const current = data.value
  if (!current) return -1
  return current.section.lessons.findIndex((l) => l.id === current.lesson.id)
})

function goPrev() {
  if (!data.value) return
  const prev = data.value.section.lessons[lessonIndex.value - 1]
  if (prev) navigateTo(`/kurzy/${courseId}/lekce/${prev.id}`)
  else navigateTo(`/kurzy/${courseId}`)
}

function completeAndNext() {
  if (!data.value) return
  completeLesson(data.value.lesson.id)
  const next = data.value.section.lessons[lessonIndex.value + 1]
  if (next) navigateTo(`/kurzy/${courseId}/lekce/${next.id}`)
  else navigateTo(`/kurzy/${courseId}`)
}
</script>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: var(--space-4);
  color: var(--text-2);
  font-size: var(--font-size--1);
}

.crumb {
  margin: 0;
  color: var(--text-2);
  font-size: var(--font-size--1);
}

h1 {
  margin: var(--space-1) 0 var(--space-4);
  color: var(--brand-color);
}

.video {
  aspect-ratio: 16 / 9;
  background: var(--color-midnight);
  border-radius: var(--radius-3);
  display: grid;
  place-items: center;
  position: relative;
}

.video .play {
  font-size: var(--font-size-6);
  color: white;
  opacity: 0.85;
}

.video .tag {
  position: absolute;
  left: var(--space-3);
  bottom: var(--space-3);
  font-size: var(--font-size--1);
  color: white;
  background: rgb(0 0 0 / 0.45);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-2);
}

.text-lesson {
  padding: var(--space-5);
  background: var(--surface-2, #f3f1ea);
  border-radius: var(--radius-3);
}

.attachments {
  margin-top: var(--space-5);
}

.attachments h2 {
  font-size: var(--font-size-1);
  margin: 0 0 var(--space-3);
}

.attach {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-right: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-peach);
  border-radius: var(--radius-3);
  text-decoration: none;
  font-size: var(--font-size--1);
}

.nav {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-6);
  flex-wrap: wrap;
}
</style>
