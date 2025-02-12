<template>
  <div class="form-wrapper p-stack">
    <p>
      <em>
        Máte dotaz okolo výživy vašeho dítěte nebo situací, které s dítětem
        zažíváte u jídla? Napište nám váš dotaz a my ho zařadíme do jedné z
        našich poraden. Až váš dotaz v podcastu zodpovíme, dáme vám o tom vědět.
      </em>
    </p>
    <form class="form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autocomplete="email"
        />
      </div>

      <div class="p-form-group">
        <label for="question">Vaše otázka *</label>
        <textarea id="question" required name="question" rows="6"></textarea>
      </div>

      <div class="p-center">
        <button
          type="submit"
          class="p-button-brand"
          :disabled="isPendingOrSuccess"
        >
          {{ isSuccess ? "Odesláno" : "Odeslat" }}
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error.message }}</div>
      <div v-if="isSuccess" class="success-message">
        Děkujeme za vaši otázku!
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { execute, error, isSuccess, isPendingOrSuccess } =
  usePodcastQuestionForm()

async function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  await execute(new FormData(form))
  if (isSuccess.value) {
    form.reset()
  }
}
</script>

<style scoped>
.form-wrapper {
  max-width: var(--size-content-2);
  box-shadow: var(--shadow-3);
  border: 1px solid var(--surface-3);
  margin-inline: auto;
  padding: var(--space-6);
  border-radius: var(--radius-4);

  @media (--sm-n-below) {
    border-radius: var(--radius-0);
    border-inline: none;
    box-shadow: none;
    padding-inline: var(--space-2);
  }
}

form {
  max-width: 30ch;
  margin-inline: auto;
}
</style>
