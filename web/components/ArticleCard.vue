<template>
  <div class="card">
    <NuxtLink :to class="image-link">
      <img :src="image" alt="" />
    </NuxtLink>

    <div class="content p-stack">
      <NuxtLink :to class="title-link">
        <component :is="headingLevel" class="title p-heading-4">{{
          title
        }}</component>
      </NuxtLink>
      <ul class="p-cluster">
        <li v-for="tag of tags" :key="tag.to">
          <Chip :to="tag.to">{{ tag.text }}</Chip>
        </li>
      </ul>
      <p class="p-secondary-text-regular">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface Tag {
  text: string
  to: string
}

export interface Card {
  image: string
  to: string
  tags: Tag[]
  title: string
  text: string
  headingLevel: "h1" | "h2" | "h3"
}

defineProps<Card>()
</script>

<style scoped>
:where(ul, li) {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

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
</style>
