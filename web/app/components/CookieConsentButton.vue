<template>
  <button type="button" @click="reopen()">Nastavení cookies</button>
</template>

<script lang="ts" setup>
// Reopening the bar clears the stored decision, so the visitor is asked again
// and consent is withdrawn until they answer.
const { reopen } = useCookieConsent()
</script>
