<template>
  <PageWrapper v-if="course" class="lms-course">
    <NuxtLink to="/kurzy" class="back">← Zpět na kurzy</NuxtLink>
    <h1>{{ course.title }}</h1>
    <p class="lead">{{ course.subtitle }}</p>

    <section v-for="(section, si) in course.sections" :key="section.id" class="section">
      <header class="s-head" :class="{ locked: !isSectionUnlocked(section) }">
        <span class="s-title">
          {{ isSectionUnlocked(section) ? "📂" : "🔒" }} {{ section.title }}
        </span>
        <span class="s-rule">{{ ruleLabel(section) }}</span>
      </header>

      <!-- Odemčená sekce: seznam lekcí -->
      <ul v-if="isSectionUnlocked(section)" class="lessons">
        <li v-for="lesson in section.lessons" :key="lesson.id">
          <NuxtLink :to="`/kurzy/${course.id}/lekce/${lesson.id}`" class="lesson">
            <span class="dot" :class="{ done: isLessonDone(lesson.id) }">
              {{ isLessonDone(lesson.id) ? "✓" : "" }}
            </span>
            <span class="l-title">{{ lesson.title }}</span>
            <span class="l-type">{{ lesson.type === "video" ? "Video" : "Text" }}</span>
          </NuxtLink>
        </li>
      </ul>

      <!-- Test odemykající následující sekci -->
      <template v-if="isSectionUnlocked(section) && section.quiz && course.sections[si + 1]">
        <button
          v-if="!showQuiz[section.id]"
          class="p-button p-button-outline"
          @click="showQuiz[section.id] = true"
        >
          Spustit test sekce →
        </button>
        <LmsQuizGate
          v-else
          :quiz="section.quiz"
          :next-section-title="course.sections[si + 1]!.title"
          @passed="passSection(course.sections[si + 1]!.id)"
        />
      </template>

      <!-- Zamčeno časem: prototypové tlačítko na simulaci uplynutí času -->
      <p v-if="section.unlock.kind === 'time' && !isSectionUnlocked(section)" class="time-hint">
        Odemkne se {{ section.unlock.days }} dní od nákupu (počítáno per student, O-19).
        <button class="p-button p-button-outline" @click="elapseTime">
          Simulovat uplynutí času
        </button>
      </p>
    </section>
  </PageWrapper>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "lms-auth", layout: "lms" })

const route = useRoute()
const { getCourse, isSectionUnlocked, isLessonDone, passSection, elapseTime } = useLms()

const course = computed(() => getCourse(route.params.course as string))
const showQuiz = reactive<Record<string, boolean>>({})

const RULE_LABEL: Record<string, string> = {
  open: "volně přístupné",
  test: "odemyká test předchozí sekce",
}
function ruleLabel(section: { unlock: { kind: string; days?: number } }) {
  if (section.unlock.kind === "time") return `odemyká čas (${section.unlock.days} dní od nákupu)`
  return RULE_LABEL[section.unlock.kind] ?? ""
}
</script>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: var(--space-4);
  color: var(--text-2);
  font-size: var(--font-size--1);
}

h1 {
  margin: 0;
  color: var(--brand-color);
}

.lead {
  margin: var(--space-1) 0 var(--space-6);
  color: var(--text-2);
}

.section {
  margin-bottom: var(--space-4);
}

.s-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-peach);
  border-radius: var(--radius-3);
  background: var(--surface-1, white);
}

.s-head.locked {
  color: var(--text-2);
  background: var(--surface-2, #f3f1ea);
}

.s-title {
  font-weight: var(--font-weight-6);
}

.s-rule {
  font-size: var(--font-size--1);
  color: var(--text-2);
}

.lessons {
  list-style: none;
  margin: var(--space-2) 0 0;
  padding: 0;
}

.lesson {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-3);
  text-decoration: none;
  color: inherit;
}

.lesson:hover {
  background: var(--surface-2, #f0eee7);
}

.dot {
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  border-radius: 50%;
  border: 2px solid var(--color-peach);
  display: grid;
  place-items: center;
  font-size: var(--font-size--2);
  color: white;
}

.dot.done {
  background: var(--color-forest-green);
  border-color: var(--color-forest-green);
}

.l-type {
  margin-left: auto;
  font-size: var(--font-size--1);
  color: var(--text-2);
}

.time-hint {
  font-size: var(--font-size--1);
  color: var(--text-2);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-2);
}

.p-button-outline {
  margin-top: var(--space-2);
}
</style>
