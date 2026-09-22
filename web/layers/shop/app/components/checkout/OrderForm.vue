<template>
  <form @submit.prevent="onSubmit">
    <!-- The title is interpolated, not markup, so the non-breaking space is
         the character itself; an entity would show up as one. -->
    <CheckoutStep :number="2" title="Údaje a souhlas">
      <BillingDetailsForm v-model="draft" />

      <label class="consent">
        <input v-model="consent" type="checkbox" name="consent" required />
        <span>
          Souhlasím s&nbsp;<NuxtLink :to="TERMS_PATH" target="_blank"
            >obchodními podmínkami kurzu</NuxtLink
          >.
        </span>
      </label>

      <p class="muted">
        Vaše údaje zpracováváme podle
        <NuxtLink :to="PRIVACY_PATH" target="_blank">zásad ochrany osobních údajů</NuxtLink>.
      </p>
    </CheckoutStep>

    <CheckoutStep :number="3" title="Platba">
      <dl class="total">
        <dt>Kurz</dt>
        <dd>{{ course.title }}</dd>
        <dt>Celkem</dt>
        <dd class="total-price">
          <strong>{{ formatPriceCzk(course.price_czk) }}</strong>
          <span class="muted">včetně všech daní. Neplátce DPH.</span>
        </dd>
      </dl>

      <button type="submit" class="p-button p-button-brand pay" :disabled="pending">
        Objednávka zavazující k&nbsp;platbě
      </button>

      <p class="muted">Pak vás přesměrujeme na&nbsp;platební bránu GoPay.</p>

      <ShopNotice :message="errorMessage" />
    </CheckoutStep>
  </form>
</template>

<script lang="ts" setup>
import type { BillingDetails, SellableCourse } from "../../../shared/utils/checkout"

// Steps 2 and 3 of the Checkout, for a Student whose step 1 is done. One form
// around both, so a single press sends the Billing Details, the Consent and
// the Order together; the two boxes are only how it reads (prototype,
// variant C).
const { course, slug, billing } = defineProps<{
  course: SellableCourse
  slug: string
  billing: BillingDetails
}>()

// The Student's own draft: nothing outside this form reads it, and it is only
// ever seeded once — logging in is what mounts this form in the first place.
const draft = ref({ ...billing })

const TERMS_PATH = "/obchodni-podminky"
const PRIVACY_PATH = "/zasady-zpracovani-osobnich-udaju"

const consent = ref(false)

const { pending, errorMessage, submit } = useAuthForm()

async function onSubmit(): Promise<void> {
  await submit(async () => {
    const { gwUrl } = await $fetch<{ gwUrl: string }>(`/api/checkout/${slug}`, {
      method: "POST",
      body: { consent: consent.value, billing: draft.value },
    })
    // GoPay's page, or the mock standing in for it: another origin in
    // production, so a full navigation rather than `navigateTo`.
    await navigateTo(gwUrl, { external: true })
  })
}
</script>

<style scoped>
/* The form is only the press that sends both steps; it must not become a box
   of its own between them. */
form {
  display: contents;
}

.consent {
  display: flex;
  gap: var(--space-3);
  /* The consent runs to two lines at phone width, so the box belongs at the
     top of the sentence rather than in the middle of it. */
  align-items: flex-start;
}

.consent input {
  /* The consent sentence is wider than the row at phone width, so without
     this the flex line shrinks the checkbox with it and the box stops being
     square. Puleo (`@lttr/puleo`) does the same for a checkbox inside
     `.p-form-group`; this one is not in one. */
  flex-shrink: 0;
}

.total {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-2) var(--space-4);
  margin: 0;
}

.total dt {
  align-self: start;
  color: var(--text-color-2);
}

.total dd {
  margin: 0;
}

/* The amount above the tax note, not beside it: side by side they read as one
   run-on sentence. */
.total-price {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.total-price strong {
  font-size: var(--font-size-1);
}

.pay {
  align-self: start;
}
</style>
