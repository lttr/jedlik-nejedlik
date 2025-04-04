<template>
  <header>
    <div class="top-line p-secondary-text-regular p-content">
      <SocialLinks />
    </div>

    <MainNav class="p-full" />
  </header>
</template>

<script lang="ts" setup></script>

<style scoped>
.top-line {
  display: flex;
  justify-content: end;
  padding-block: var(--space-3);
  font-size: var(--font-size-0);
}
</style>
