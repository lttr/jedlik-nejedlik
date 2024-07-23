<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
useHead({
  htmlAttrs: {
    class: "is-light",
  },
})
</script>

<style scoped></style>
