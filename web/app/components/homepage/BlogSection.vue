<template>
  <PageSection class="blog">
    <SvgoSpirala class="spirala" />
    <SvgoStopka class="stopka" />
    <div class="wrapper p-stack p-center">
      <h2 class="heading">Blog</h2>
      <div class="posts-wrapper p-center">
        <div class="posts p-switcher">
          <ArticleCard
            v-for="article of articles"
            :key="article.id"
            class="post"
            heading-level="h3"
            v-bind="article"
          />
        </div>
        <button class="cta">Všechny články</button>
      </div>
    </div>
    <SvgoJahoda class="jahoda" />
  </PageSection>
</template>

<script setup lang="ts">
const { data: articles } = await useArticles()
</script>

<style scoped>
.blog {
  background-color: var(--color-peach);
  position: relative;
  margin-bottom: 20rem;
}

.wrapper {
  --stack-space: var(--space-7);
  height: 23rem;
}

.posts {
  justify-content: center;
}

.spirala {
  position: absolute;
  transform: rotate(40deg) scale(-1, -1);
  left: 51vw;
  top: -2rem;
  width: 8ch;
  stroke-width: 0.5rem;
}

.cta {
  margin-top: var(--space-6);
}

.jahoda {
  position: absolute;
  right: -10rem;
  bottom: -22rem;
  width: 10ch;
  z-index: -1;
}

.stopka {
  position: absolute;
  width: 6ch;
  left: -3rem;
  top: 2rem;
  stroke-width: 0.6rem;
}

@media (--lg-n-below) {
  .blog {
    margin-bottom: 0;
  }

  .wrapper {
    height: auto;
  }

  .spirala,
  .jahoda {
    display: none;
  }

  .stopka {
    left: 1rem;
  }
}
</style>
