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
// Every form that *sets* a password — registration, reset completion, and the
// change-password form to come — is this field: the same autocomplete hint to
// the browser, the same policy hint to the Student, and the same
// `aria-describedby` tying the two together. Wording and wiring live here so
// they cannot drift from one form to the next.
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
