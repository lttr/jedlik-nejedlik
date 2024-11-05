<template>
  <div class="card">
    <NuxtLink :to class="image-link">
      <img :src="image" alt="" />
    </NuxtLink>

    <div class="content p-stack">
      <ul class="p-cluster">
        <li v-for="tag of tags" :key="tag.to">
          <TagLink :to="tag.to">{{ tag.text }}</TagLink>
        </li>
      </ul>
      <NuxtLink :to class="title-link">
        <component :is="headingLevel" class="title p-heading-4">{{
          title
        }}</component>
      </NuxtLink>
      <p class="p-secondary-text-regular">
        {{ text }}
      </p>

      <button class="cta p-secondary">Call to action</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  id: number
  image: string
  tags: Tag[]
  text: string
  title: string
  to: string
  headingLevel: "h1" | "h2" | "h3"
}>()
</script>

<style scoped>
.card {
  max-width: 35ch;
  box-shadow: var(--shadow-4);
  background-color: var(--bg-color-body);
}

.content {
  --stack-space: var(--space-4);
  padding-block: var(--space-5);
  padding-inline: var(--space-5);
}

.image-link {
  padding: 0;
  margin: 0;
}

.title-link {
  display: flex;
  text-decoration: none;
  margin-inline: 0;
  padding: 0;
  color: var(--color-color-body);

  &:hover {
    text-decoration: underline;
  }
}

.title {
  font-weight: var(--font-weight-headings);
}

.cta {
  width: 100%;
}

ul,
li {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
