<template>
  <p v-if="visible" :class="`${tone}-message`" :role="tone === 'error' ? 'alert' : 'status'">
    <slot>{{ message }}</slot>
  </p>
</template>

<script lang="ts" setup>
// The shop's one notice. The auth layer has `<AuthFormError>`, which only ever
// says something went wrong; the Checkout, the return page and „Moje kurzy"
// also have good news to deliver, so this one takes a tone. The classes are
// the site-wide `.error-message` / `.success-message` from `main.css`, so a
// shop notice looks like every other notice on the site.
//
// The text can come as `message` (the usual case, straight from a form's
// `errorMessage`) or as the default slot when it needs a link inside it.
const { message = "", tone = "error" } = defineProps<{
  message?: string
  tone?: "error" | "success"
}>()

const slots = useSlots()

// A slot always wins: a caller that passes one means to show it.
const visible = computed(() => slots.default !== undefined || message !== "")
</script>
