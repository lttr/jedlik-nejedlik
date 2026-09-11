<template>
  <PageWrapper class="thank-you-page">
    <div class="thank-you-content">
      <Icon name="uil:check-circle" class="success-icon" />
      <h1>{{ title }}</h1>
      <slot />
      <p class="team-signature">Tým Jedlík-nejedlík</p>
      <slot name="action" />
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
// The shell every thank-you page shares: centred card, success icon, heading,
// signature, and one button back into the site. The page contributes only its
// own copy, in the default slot, and its own link, in `action`.
const { title } = defineProps<{ title: string }>()
</script>

<style scoped>
.thank-you-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thank-you-content {
  text-align: center;
  max-width: var(--size-content-2);
  padding: var(--space-8) var(--space-4);
}

.success-icon {
  font-size: 4rem;
  color: var(--color-forest-green);
  margin-bottom: var(--space-4);
}

.thank-you-content h1 {
  font-size: var(--font-size-4);
  color: var(--brand-color);
  margin-bottom: var(--space-4);
}

/* The page's own copy arrives through the slot, so it carries the page's scope
   rather than this component's; `:slotted` is what reaches it. The bare `p` is
   the signature below: it needs the same rule at the same specificity, which is
   how it rendered before this shell was extracted. */
.thank-you-content :slotted(p),
.thank-you-content p {
  color: var(--text-color-2);
  margin-bottom: var(--space-3);
}

.thank-you-content :slotted(.lead) {
  font-size: var(--font-size-2);
  /* Inherited on purpose. This was `var(--text-1)`, a property no stylesheet
     defines, so the declaration has always been dropped and the lead has always
     inherited. Naming a real token here would change the rendered colour. */
  color: inherit;
}

.team-signature {
  font-weight: var(--font-weight-6);
  color: var(--brand-color);
  margin-bottom: var(--space-5);
}

.thank-you-content :slotted(.p-button) {
  margin-top: var(--space-4);
}
</style>
