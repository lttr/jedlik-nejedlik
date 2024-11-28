<template>
  <div class="biography-expert p-switcher">
    <div>
      <NuxtImg
        v-if="bio.photo"
        :src="bio.photo.id"
        :width="bio.photo.width"
        :height="bio.photo.height"
        sizes="400px"
        loading="lazy"
        alt="bio.description"
        class="photo"
      />
    </div>
    <div class="texts p-flow">
      <p class="p-heading-4">
        {{ bio.name }}
      </p>
      <p class="description">{{ bio.description }}</p>
      <p>
        <NuxtLink v-if="bio.url" external to="bio.url">{{
          displayUrl(bio.url)
        }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface BiographyExpert {
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

.photo {
  border-radius: var(--radius-round);
  max-width: 30ch;
}

.description {
  max-width: max(50vw, var(--size-content-2));
}
</style>
