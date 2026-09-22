<template>
  <p v-if="visible" :class="`${tone}-message`" :role="tone === 'error' ? 'alert' : 'status'">
    <slot>{{ message }}</slot>
  </p>
</template>

<script lang="ts" setup>
// The shop's one notice. The auth layer's `<AuthFormError>` only ever says
// something went wrong; the Checkout, the return page and „Moje kurzy" also
// have good news to deliver, so this one takes a tone — `info` being the
// refusal that is neither, like „this Course is not on sale yet". The classes
// are the site-wide `.error-message` / `.success-message` / `.info-message`
// from `main.css`. The text comes as `message`, or as the default slot when it
// needs a link inside it.
const { message = "", tone = "error" } = defineProps<{
  message?: string
  tone?: "error" | "success" | "info"
}>()

const slots = useSlots()

const visible = computed(() => slots.default !== undefined || message !== "")
</script>
