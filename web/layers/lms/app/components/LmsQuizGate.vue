<template>
  <div class="quiz">
    <p class="intro">
      Test na konci sekce. Hranice úspěšnosti <strong>{{ quiz.passPercent }} %</strong>, neomezené
      pokusy bez prodlevy (O-7). Úspěch odemyká trvale (R-6).
    </p>

    <form @submit.prevent="evaluate">
      <fieldset v-for="(q, i) in quiz.questions" :key="q.id" class="q">
        <legend>{{ i + 1 }}. {{ q.text }}</legend>
        <label v-for="opt in q.options" :key="opt.id" class="opt">
          <input v-model="answers[q.id]" type="radio" :name="q.id" :value="opt.id" />
          {{ opt.text }}
        </label>
      </fieldset>

      <p v-if="result === 'ok'" class="success-message">
        ✓ Test splněn. Sekce „{{ nextSectionTitle }}“ odemčena — trvale.
      </p>
      <p v-else-if="result === 'bad'" class="error-message">
        ✗ Zatím ne. Zkuste to znovu, bez prodlevy a bez omezení pokusů.
      </p>

      <button class="p-button p-button-brand" type="submit">Vyhodnotit test</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Quiz } from "../composables/useLms"

const props = defineProps<{ quiz: Quiz; nextSectionTitle: string }>()
const emit = defineEmits<{ passed: [] }>()

const answers = reactive<Record<string, string>>({})
const result = ref<"ok" | "bad" | null>(null)

function evaluate() {
  const correct = props.quiz.questions.filter((q) => answers[q.id] === q.correct).length
  const percent = (correct / props.quiz.questions.length) * 100
  if (percent >= props.quiz.passPercent) {
    result.value = "ok"
    emit("passed")
  } else {
    result.value = "bad"
  }
}
</script>

<style scoped>
.quiz {
  margin-top: var(--space-3);
  padding: var(--space-4);
  background: var(--surface-1, white);
  border: 1px solid var(--color-peach);
  border-radius: var(--radius-3);
}

.intro {
  margin: 0 0 var(--space-4);
  font-size: var(--font-size--1);
  color: var(--text-2);
}

.q {
  border: none;
  padding: 0;
  margin: 0 0 var(--space-4);
}

.q legend {
  font-weight: var(--font-weight-6);
  margin-bottom: var(--space-2);
}

.opt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-peach);
  border-radius: var(--radius-3);
  margin-bottom: var(--space-2);
  cursor: pointer;
}

.opt input {
  width: auto;
}
</style>
