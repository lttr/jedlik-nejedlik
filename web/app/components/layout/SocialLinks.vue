<template>
  <div class="p-cluster">
    <NuxtLink
      class="link"
      to="https://www.facebook.com/profile.php?id=100092040743458"
    >
      <Icon name="bi:facebook" />
    </NuxtLink>
    <NuxtLink class="link" to="https://www.instagram.com/jedlik_nejedlik/">
      <Icon name="bi:instagram" />
    </NuxtLink>
    <NuxtLink
      class="link"
      to="https://open.spotify.com/show/7DdV5v4nOSVHLWij5Y9a0p"
    >
      <Icon name="bi:spotify" class="podcast-platform" />
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.link {
  color: currentColor;
}

.link:visited {
  color: currentColor;
}
</style>
