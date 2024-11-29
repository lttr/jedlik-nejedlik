<template>
  <div class="social-links">
    <NuxtLink
      class="link"
      to="https://www.facebook.com/profile.php?id=100092040743458"
    >
      <Icon name="uil:facebook" />
    </NuxtLink>
    <NuxtLink class="link" to="https://www.instagram.com/jedlik_nejedlik/">
      <Icon name="uil:instagram" />
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.social-links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.link:visited {
  color: currentColor;
}
</style>
