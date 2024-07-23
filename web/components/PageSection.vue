<template>
  <section class="page-section p-content-padded">
    <slot></slot>
  </section>
</template>

<script lang="ts" setup></script>

<style scoped>
:where(.page-section) {
  padding-block: var(--space-7);
  border-radius: var(--radius-4);
}
</style>
