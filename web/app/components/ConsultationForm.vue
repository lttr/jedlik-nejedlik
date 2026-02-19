<template>
  <div class="form-wrapper">
    <h2>
      Objednejte se na konzultaci a&nbsp;začněte s&nbsp;řešením vašich otázek
      ohledně výživy ještě dnes.
    </h2>
    <p>Konzultace poskytujeme osobně v&nbsp;Hradci Králové nebo online.</p>
    <p>Objednat se můžete prostřednictvím níže uvedeného formuláře.</p>

    <form class="form" @submit.prevent="onSubmit">
      <div class="p-form-group">
        <label for="consultation-name">Jméno</label>
        <input
          id="consultation-name"
          type="text"
          name="name"
          autocomplete="name"
        />
      </div>

      <div class="p-form-group">
        <label for="consultation-email">E-mail *</label>
        <input
          id="consultation-email"
          type="email"
          name="email"
          required
          autocomplete="email"
        />
      </div>

      <div class="p-form-group">
        <label for="consultation-phone">Telefonní číslo *</label>
        <input
          id="consultation-phone"
          type="tel"
          name="phone"
          required
          autocomplete="tel"
        />
      </div>

      <div class="p-form-group">
        <label for="consultation-service"
          >Napište název služby, o&nbsp;kterou máte zájem (Konzultace, webinář,
          přednáška, měření na inbody 270) *</label
        >
        <input
          id="consultation-service"
          type="text"
          name="service"
          required
          autocomplete="off"
        />
      </div>

      <div class="p-form-group">
        <label for="consultation-question">Máte nějaký dotaz?</label>
        <textarea
          id="consultation-question"
          name="question"
          rows="4"
        ></textarea>
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
        Děkujeme! Ozveme se vám co nejdříve.
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
const { execute, error, isSuccess, isPendingOrSuccess } = useConsultationForm()

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

h2 {
  text-align: center;
  margin-bottom: var(--space-2);
}

.form-wrapper > p {
  text-align: center;
  color: var(--text-2);
  margin-block: var(--space-1);
}

form {
  max-width: 40ch;
  margin-inline: auto;
  margin-top: var(--space-5);
}

textarea {
  width: 100%;
  resize: vertical;
}
</style>
