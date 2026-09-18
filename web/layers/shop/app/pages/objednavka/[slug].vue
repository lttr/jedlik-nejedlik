<template>
  <PageWrapper>
    <div class="checkout p-flow">
      <h1 class="p-heading-3">Objednávka kurzu</h1>

      <!-- A Course this Student cannot buy: already theirs, or not on sale.
           The form is never rendered for them (ticket 03, acceptance). -->
      <div v-if="refusal" class="refused p-flow">
        <ShopNotice :message="refusal.message" :tone="refusalTone" />
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
          <CheckoutAccountStep :email="checkout.email" :verified @logged-in="onLoggedIn" />

          <CheckoutOrderForm
            v-if="checkout.email !== null"
            v-model:billing="billing"
            :course="checkout.course"
            :slug
          />

          <!-- A visitor sees what is still to come, so the page reads as three
               steps rather than as a login form with something behind it. -->
          <template v-else>
            <CheckoutStep :number="2" title="Údaje a souhlas" locked>
              <p class="muted">Jméno na&nbsp;doklad a&nbsp;souhlas s&nbsp;obchodními podmínkami.</p>
            </CheckoutStep>
            <CheckoutStep :number="3" title="Platba" locked>
              <p class="muted">Platební brána GoPay (karta, bankovní tlačítko).</p>
            </CheckoutStep>
          </template>
        </div>

        <aside class="aside">
          <CheckoutRecap :course="checkout.course" />
        </aside>
      </div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { emptyBillingDetails, readRefusal } from "../../../shared/utils/checkout"
import type { CheckoutView } from "../../../shared/utils/checkout"

// Three steps on one page with the Course alongside (prototype, variant C).
// No `auth` middleware: a visitor without an Account gets the same page and
// logs in or registers inside step 1, because being sent somewhere else is how
// a purchase loses sight of what it is buying (spec, user story 2).

const route = useRoute()
const slug = String(route.params.slug)

// Through Nitro, never Directus from the browser (ADR 0004). The route decides
// whether this caller may buy this Course at all, so a refusal here is the
// page's refusal: the form is never rendered.
const {
  data: checkout,
  error,
  refresh: refreshCheckout,
} = await useFetch<CheckoutView>(`/api/checkout/${slug}`, {
  key: `checkout:${slug}`,
})

// The verification landing sends the Account back here with the same flag it
// puts on the login page, and step 1 says the e-mail is verified (ADR 0005).
const verified = computed(() => route.query[EMAIL_VERIFIED_QUERY] !== undefined)

// A 409 is a Course this Student may not buy, which the page says in its own
// words. Everything else is the site's error page: no readable Course is a
// 404, worded like Nuxt's own route miss, because a draft must not be
// distinguishable from a slug that never existed (ADR 0004).
//
// Computed, because a visitor who logs in inside step 1 asks the route again
// and may be refused only then: „Tenhle kurz už máte" belongs to the Account,
// not to the request that rendered the page.
const refusal = computed(() => readRefusal(error.value, 409))

// Owning the Course already is good news; a Course that is not on sale yet is
// nobody's fault, so it gets the neutral tone rather than the green one.
const refusalTone = computed(() =>
  refusal.value?.code === "already_entitled" ? "success" : "info",
)

if (error.value !== undefined && refusal.value === undefined) {
  throwPageError(error.value, route.path)
}

// Pre-filled from the Account, so a returning Student only checks them.
const billing = ref(checkout.value?.billing ?? emptyBillingDetails())

// Step 1 is done: ask the route again, which now answers with the Student's
// e-mail, their Billing Details and any refusal their session brings with it
// — all without a page change (spec, user story 2).
async function onLoggedIn(): Promise<void> {
  await refreshCheckout()
  if (error.value !== undefined && refusal.value === undefined) {
    showError(error.value)
    return
  }
  billing.value = checkout.value?.billing ?? emptyBillingDetails()
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

.muted {
  color: var(--text-color-2);
  font-size: var(--font-size-0);
}

.aside {
  @media (--md-n-above) {
    position: sticky;
    inset-block-start: var(--space-4);
  }
}
</style>
