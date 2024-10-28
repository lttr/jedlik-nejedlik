<template>
  <footer class="footer">
    <SiteLogo class="logo" />
    <!-- <div class="p-stack"> -->
    <!--   <p>123 456 789</p> -->
    <!--   <div><a href="/">O nás</a></div> -->
    <!--   <div><a href="/">FAQ</a></div> -->
    <!--   <SocialLinks /> -->
    <!-- </div> -->
  </footer>
</template>

<script lang="ts" setup></script>

<style scoped>
.footer {
  color: var(--text-color-1-inverse);
  background-color: var(--color-midnight);
  padding-block: var(--space-9);

  > * {
    --stack-space: var(--space-2);
  }

  a {
    font-size: var(--font-size--1);
    text-decoration: none;
    color: var(--text-color-1-inverse);
  }
}

.logo {
  color: var(--color-pale-blue);
}
</style>
