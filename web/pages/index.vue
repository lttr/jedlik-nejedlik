<template>
  <main>
    <div class="p-stack p-center">
      <div>
        <SvgoLogoOneline class="logo" />
      </div>
      <div>
        <NuxtLink to="/tabor">Tábor</NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts"></script>

<style scoped>
.logo {
  width: 300px;
  height: auto;
}

main {
  height: 100vh;
  display: grid;
  place-content: center;
}
</style>
