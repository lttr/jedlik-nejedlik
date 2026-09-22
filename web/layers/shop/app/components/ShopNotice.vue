<template>
  <p v-if="visible" :class="`${tone}-message`" :role="tone === 'error' ? 'alert' : 'status'">
    <slot>{{ message }}</slot>
  </p>
</template>

<script lang="ts" setup>
// The shop's one notice: unlike the auth layer's `<AuthFormError>` it also
// carries good news, so it takes a tone — `info` being the refusal that is
// neither. The classes are the site-wide ones from `main.css`.
const { message = "", tone = "error" } = defineProps<{
  message?: string
  tone?: "error" | "success" | "info"
}>()

const slots = useSlots()

const visible = computed(() => slots.default !== undefined || message !== "")
</script>
