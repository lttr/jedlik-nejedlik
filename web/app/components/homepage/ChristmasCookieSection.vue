<template>
  <section class="christmas-cookie p-full-bg">
    <div class="content-wrapper">
      <div class="p-stack">
        <span class="chip">e-kniha</span>
        <h1 class="heading p-heading-1">Jak na cukroví s dětmi?</h1>
        <p class="description">
          Pomůžeme Vám, aby bylo Vaše vánoční pečení a mlsání s dětmi chutné,
          bez starostí a bez výčitek. I na návštěvách!
        </p>
        <div class="p-cluster">
          <NuxtLink to="/vanocni-cukrovi" class="cta p-button"
            >Koupit e-knihu</NuxtLink
          >
          <NuxtLink to="/o-nas" class="link p-button">O nás</NuxtLink>
        </div>
      </div>
      <div class="decorative-cookies-wrapper">
        <SvgoCukroviOpt class="decorative-cookies" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.christmas-cookie {
  background-color: var(--color-burgundy-red);
  color: white;
  position: relative;
  overflow: hidden;
  padding-block: var(--space-7);
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-7);
  align-items: center;
}

.chip {
  width: fit-content;
  font-size: var(--font-size--1);
  padding-inline: var(--space-2);
  padding-block: 3px;
  border-radius: var(--radius-default);
  border: var(--border-size-1) solid var(--text-color-1-inverse);
  color: var(--text-color-1-inverse);
}

.heading {
  --stack-space: var(--space-1);
  font-weight: var(--font-weight-7);
  line-height: var(--font-lineheight-1);
}

.description {
  --stack-space: var(--space-2);
  max-width: var(--size-content-2);
  text-wrap: pretty;
}

.decorative-cookies-wrapper {
  transform: scale(1.3) translateX(3rem);
}

.decorative-cookies {
  width: 100%;
  height: auto;
  justify-self: end;
  margin-left: auto;
}

.cta {
  font-size: var(--font-size-0);
  padding-inline: var(--space-5);
  --_text-color: var(--color-forest-green);
  --_bg-color: var(--color-light-lime);
  --_border-color: var(--color-light-lime);
  --_bg-color-hover: color-mix(in srgb, var(--color-light-lime) 50%, white);
  --_bg-color-active: var(--color-light-lime);
  box-shadow: none;
  margin: 0;
}

.link {
  font-size: var(--font-size-0);
  padding-inline: var(--space-5);
  --_text-color: var(--text-color-2);
  --_bg-color: var(--color-peach);
  --_border-color: var(--color-peach);
  --_bg-color-hover: color-mix(in srgb, var(--color-peach) 30%, white);
  --_bg-color-active: var(--color-peach);
  box-shadow: none;
  margin: 0;
}

@media (--lg-n-below) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .decorative-cookies-wrapper {
    transform: scale(1.4) translateY(2vw) translateX(-9vw);
  }

  .decorative-cookies {
    max-width: 25rem;
  }

  .christmas-cookie {
    padding-top: var(--space-6);
  }
}
</style>
