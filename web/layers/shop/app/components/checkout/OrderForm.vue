<template>
  <form @submit.prevent="onSubmit">
    <CheckoutStep :number="2" title="Údaje a souhlas">
      <BillingDetailsForm v-model="billing" />

      <label class="consent">
        <input v-model="consent" type="checkbox" name="consent" required />
        <span>
          Souhlasím s
          <NuxtLink :to="TERMS_PATH" target="_blank">obchodními podmínkami kurzu</NuxtLink>.
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
        Objednávka zavazující k platbě
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
const { course, slug } = defineProps<{ course: SellableCourse; slug: string }>()

const billing = defineModel<BillingDetails>("billing", { required: true })

const TERMS_PATH = "/obchodni-podminky"
const PRIVACY_PATH = "/zasady-zpracovani-osobnich-udaju"

const consent = ref(false)

// The same pending/error pair every form on this site uses, error messages
// mapped the same way.
const { pending, errorMessage, submit } = useAuthForm()

async function onSubmit(): Promise<void> {
  await submit(async () => {
    const { gwUrl } = await $fetch<{ gwUrl: string }>(`/api/checkout/${slug}`, {
      method: "POST",
      body: { consent: consent.value, billing: billing.value },
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
  /* `main.css` gives every input `width: 100%`, which outranks Puleo's
     zero-specificity checkbox sizing and stretches a bare checkbox across the
     row. Puleo's own sizes, restored at a specificity that wins. */
  flex: 0 0 auto;
  inline-size: var(--space-4);
  block-size: var(--space-4);
  margin-block-start: 0.35rem;

  @media (pointer: coarse) {
    inline-size: var(--space-5);
    block-size: var(--space-5);
  }
}

.muted {
  color: var(--text-color-2);
  font-size: var(--font-size-0);
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
