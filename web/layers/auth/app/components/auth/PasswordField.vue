<template>
  <div class="p-form-group">
    <label :for="id">{{ label }}</label>
    <input
      :id
      v-model="password"
      type="password"
      name="password"
      required
      :autofocus
      autocomplete="new-password"
      :aria-describedby="hintId"
    />
    <p :id="hintId" class="password-hint">Alespoň {{ PASSWORD_MIN_LENGTH }} znaků.</p>
  </div>
</template>

<script lang="ts" setup>
// Every form that sets a password uses this field, so the autocomplete hint,
// the policy hint and the `aria-describedby` wiring cannot drift between them.
const {
  id,
  label = "Heslo",
  autofocus = false,
} = defineProps<{
  // Distinct per form, so two password fields could share a page.
  id: string
  label?: string
  autofocus?: boolean
}>()

const password = defineModel<string>({ required: true })

const hintId = computed(() => `${id}-hint`)
</script>

<style scoped>
.password-hint {
  font-size: var(--font-size--1);
  line-height: var(--font-lineheight-3);
  color: var(--text-2);
}
</style>
