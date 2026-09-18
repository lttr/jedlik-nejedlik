<template>
  <PageWrapper>
    <div class="checkout p-flow">
      <h1 class="p-heading-3">Objednávka kurzu</h1>

      <!-- A Course this Student cannot buy: already theirs, or not on sale.
           The form is never rendered for them (ticket 03, acceptance). -->
      <div v-if="refusal" class="refused p-flow">
        <ShopNotice :message="refusal.message" tone="success" />
        <p>
          <NuxtLink
            v-if="refusal.code === 'already_entitled'"
            to="/muj-ucet"
            class="p-button p-button-brand"
            >Přejít do Mého účtu</NuxtLink
          >
          <NuxtLink v-else to="/kurzy" class="p-button p-button-brand">Zpět na kurzy</NuxtLink>
        </p>
      </div>

      <div v-else-if="checkout" class="two-col">
        <div class="steps">
          <section class="step done">
            <h2><span class="num" aria-hidden="true">✓</span>Účet</h2>
            <p class="muted">
              Přihlášeni jako <strong>{{ checkout.email }}</strong>
            </p>
          </section>

          <form @submit.prevent="onSubmit">
            <section class="step">
              <h2><span class="num" aria-hidden="true">2</span>Údaje a souhlas</h2>

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
                <NuxtLink :to="PRIVACY_PATH" target="_blank">zásad ochrany osobních údajů</NuxtLink
                >.
              </p>
            </section>

            <section class="step">
              <h2><span class="num" aria-hidden="true">3</span>Platba</h2>

              <dl class="total">
                <dt>Kurz</dt>
                <dd>{{ checkout.course.title }}</dd>
                <dt>Celkem</dt>
                <dd class="total-price">
                  <strong>{{ formatPriceCzk(checkout.course.price_czk) }}</strong>
                  <span class="muted">včetně všech daní. Neplátce DPH.</span>
                </dd>
              </dl>

              <button type="submit" class="p-button p-button-brand pay" :disabled="pending">
                Objednávka zavazující k platbě
              </button>

              <p class="muted">Pak vás přesměrujeme na&nbsp;platební bránu GoPay.</p>

              <ShopNotice :message="errorMessage" />
            </section>
          </form>
        </div>

        <aside class="aside">
          <div class="recap p-flow">
            <CourseCover
              v-if="checkout.course.cover"
              class="cover"
              :image="checkout.course.cover"
              sizes="90vw md:320px"
            />
            <p class="muted">Objednávka kurzu</p>
            <strong>{{ checkout.course.title }}</strong>
            <p class="price">{{ formatPriceCzk(checkout.course.price_czk) }}</p>
            <ul class="delivery muted">
              <li>Přístup ihned po&nbsp;zaplacení, bez&nbsp;časového omezení.</li>
              <li>Videa sledujete v&nbsp;prohlížeči na&nbsp;počítači, tabletu i&nbsp;telefonu.</li>
              <li>Kurz se nestahuje, zůstává vám na&nbsp;webu.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { emptyBillingDetails, readRefusal } from "../../../shared/utils/checkout"
import type { CheckoutView } from "../../../shared/utils/checkout"

// Three steps on one page with the Course alongside (prototype, variant C).
// This is the logged-in Student's Checkout; step 1 is therefore already done
// and collapsed to the e-mail. The guest's version of step 1 — the „Mám účet"
// and „Jsem tu poprvé" tabs — is area 04's ticket 06, and replaces the `auth`
// middleware below.
definePageMeta({ middleware: "auth" })

const TERMS_PATH = "/obchodni-podminky"
const PRIVACY_PATH = "/zasady-zpracovani-osobnich-udaju"

const route = useRoute()
const slug = String(route.params.slug)

// Through Nitro, never Directus from the browser (ADR 0004). The route decides
// whether this Student may buy this Course at all, so a refusal here is the
// page's refusal: the form is never rendered.
const { data: checkout, error } = await useFetch<CheckoutView>(`/api/checkout/${slug}`, {
  key: `checkout:${slug}`,
})

// A 409 is a Course this Student may not buy, which the page says in its own
// words. Everything else is the site's error page: no readable Course is a
// 404, worded like Nuxt's own route miss, because a draft must not be
// distinguishable from a slug that never existed (ADR 0004).
const refusal = readRefusal(error.value, 409)

if (error.value !== undefined && refusal === undefined) {
  throwPageError(error.value, route.path)
}

// Pre-filled from the Account, so a returning Student only checks them.
const billing = ref(checkout.value?.billing ?? emptyBillingDetails())
const consent = ref(false)

// The same pending/error pair every form on this site uses, error messages
// mapped the same way.
const { pending, errorMessage, submit } = useAuthForm()

async function onSubmit() {
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

useSeoMeta({ title: "Objednávka kurzu", robots: "noindex, nofollow" })
</script>

<style scoped>
.checkout {
  --flow-space: var(--space-6);
}

.refused {
  max-width: var(--size-content-2);
}

.two-col {
  display: grid;
  gap: var(--space-6);
  align-items: start;

  @media (--md-n-above) {
    grid-template-columns: minmax(0, 1fr) 22rem;
  }
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* The form wraps steps 2 and 3 so one press sends both, without becoming a
   box of its own between them. */
.steps > form {
  display: contents;
}

.step {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-3);
}

.step.done {
  opacity: 0.75;
}

.step h2 {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin: 0;
  font-size: var(--font-size-2);
}

.num {
  display: inline-grid;
  place-items: center;
  inline-size: 1.8rem;
  block-size: 1.8rem;
  border-radius: 50%;
  background: var(--brand-color);
  color: var(--surface-1);
  font-size: var(--font-size--1);
  font-weight: var(--font-weight-6);
}

.step.done .num {
  background: var(--text-color-1);
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

.aside {
  @media (--md-n-above) {
    position: sticky;
    inset-block-start: var(--space-4);
  }
}

.recap {
  --flow-space: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-3);
}

.cover {
  --flow-space: 0;
  margin-block-end: var(--space-4);
  border-radius: var(--radius-2);
}

.price {
  font-size: var(--font-size-3);
  color: var(--brand-color);
}

.delivery {
  --flow-space: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  /* The stylesheet drops list markers site-wide, so an indent would only leave
     the lines hanging off the rest of the recap. */
  padding-inline-start: 0;
}
</style>
