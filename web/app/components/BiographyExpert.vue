<template>
  <div class="biography-expert p-switcher">
    <div>
      <ProfileImg v-if="bio.photo" :image="bio.photo" />
    </div>
    <div class="texts p-flow">
      <p class="p-heading-4">
        {{ bio.name }}
      </p>
      <p class="description">{{ bio.description }}</p>
      <p>
        <NuxtLink v-if="bio.url" external :to="bio.url">{{
          displayUrl(bio.url)
        }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface BiographyExpert {
  name: string
  description?: string
  photo?: Image
  url?: string
}

defineProps<{
  bio: BiographyExpert
}>()
</script>

<style scoped>
.biography-expert {
  --cluster-space: var(--space-6);
  align-items: center;
}

.description {
  max-width: max(50vw, var(--size-content-2));
}
</style>
