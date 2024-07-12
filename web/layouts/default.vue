<template>
  <main>
    <slot></slot>
  </main>
</template>

<script lang="ts" setup>
useHead({
  htmlAttrs: {
    class: "is-light",
  },
})
</script>

<style scoped></style>
