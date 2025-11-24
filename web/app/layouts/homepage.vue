<template>
  <div class="p-layout-wrapper">
    <Header class="header p-page-layout" />
    <main>
      <slot></slot>
    </main>
    <Footer class="p-page-layout" />
  </div>
</template>

<script lang="ts" setup>
useHead({
  htmlAttrs: {
    class: "is-light",
  },
})
</script>

<style scoped>
</style>
