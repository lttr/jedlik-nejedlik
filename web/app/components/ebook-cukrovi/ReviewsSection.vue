<template>
  <section class="section reviews p-full-bg">
    <div>
      <h2 class="section-title">Co říkají ti, kdo už ho mají</h2>
      <figure class="card doctor-review">
        <blockquote>
          <p class="review-heading large">„{{ DOCTOR_REVIEW.heading }}“</p>
          <p v-for="paragraph of DOCTOR_REVIEW.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </blockquote>
        <figcaption class="reviewer">
          <img
            :src="DOCTOR_REVIEW.image"
            alt=""
            class="avatar large"
            width="80"
            height="80"
            loading="lazy"
          />
          <span>
            <strong>{{ DOCTOR_REVIEW.name }}</strong>
            <span>{{ DOCTOR_REVIEW.role }}</span>
          </span>
        </figcaption>
      </figure>
      <div class="parent-reviews">
        <figure v-for="review of PARENT_REVIEWS" :key="review.name" class="card">
          <blockquote>
            <p class="review-heading">„{{ review.heading }}“</p>
            <p>{{ review.quote }}</p>
          </blockquote>
          <figcaption class="reviewer">
            <img :src="review.image" alt="" class="avatar" width="56" height="56" loading="lazy" />
            <span>
              <strong>{{ review.name }}</strong>
              <span>{{ review.role }}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DOCTOR_REVIEW, PARENT_REVIEWS } from "./content"
</script>

<style scoped>
.reviews {
  background-color: color-mix(in srgb, var(--color-pale-blue) 20%, white);
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  padding: var(--space-6);
  border-radius: var(--radius-4);
  background: white;
  box-shadow: var(--card-shadow);

  blockquote {
    margin: 0;

    p + p {
      margin-top: var(--space-3);
    }
  }

  @media (--md-n-below) {
    padding: var(--space-5);
  }
}

.review-heading {
  margin-bottom: var(--space-3);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);
  line-height: 1.3;

  &.large {
    font-size: var(--font-size-3);
  }
}

.doctor-review {
  margin-top: var(--space-7);
}

.parent-reviews {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-5);
  margin-top: var(--space-5);
}

.reviewer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-5);

  > span {
    display: flex;
    flex-direction: column;
    font-size: var(--font-size--1);
    color: var(--muted);
  }

  strong {
    font-size: var(--font-size-0);
    color: var(--color-navy);
  }
}
</style>
