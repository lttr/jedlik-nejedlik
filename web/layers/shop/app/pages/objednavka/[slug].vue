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
            :billing="checkout.billing"
            :course="checkout.course"
            :slug
          />

          <!-- A visitor sees what is still to come, so the page reads as three
               steps rather than as a login form with something behind it. -->
          <template v-else>
            <CheckoutStep :number="2" title="Údaje a souhlas" locked>
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
import { readRefusal } from "#layers/shop/shared/utils/checkout"
import type { CheckoutView } from "#layers/shop/shared/utils/checkout"
import { EMAIL_VERIFIED_QUERY } from "#layers/auth/shared/utils/redirects"
import PageWrapper from "#layers/base/app/components/PageWrapper.vue"
import CheckoutAccountStep from "#layers/shop/app/components/checkout/AccountStep.vue"
import CheckoutOrderForm from "#layers/shop/app/components/checkout/OrderForm.vue"
import CheckoutRecap from "#layers/shop/app/components/checkout/Recap.vue"
import CheckoutStep from "#layers/shop/app/components/checkout/Step.vue"
import ShopNotice from "#layers/shop/app/components/ShopNotice.vue"
import { throwPageError } from "#layers/shop/app/utils/page-error"

// Three steps on one page, and no `auth` middleware: a visitor logs in or
// registers inside step 1 rather than being sent away from what they are
// buying. See docs/shop.md, „Checkout page".

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

// The verification landing (`/overeni-emailu`) sends the Account back here
// with the same query flag it puts on the login page, and step 1 says the
// e-mail is verified (ADR 0005).
const verified = computed(() => route.query[EMAIL_VERIFIED_QUERY] !== undefined)

// A 409 is a Course this Student may not buy, and the page says so in its own
// words. Computed, because logging in inside step 1 may be refused only then.
// See docs/shop.md, „Checkout page".
const refusal = computed(() => readRefusal(error.value, 409))

// Owning the Course already is good news; a Course that is not on sale yet is
// nobody's fault, so it gets the neutral tone rather than the green one.
const refusalTone = computed(() =>
  refusal.value?.code === "already_entitled" ? "success" : "info",
)

if (error.value !== undefined && refusal.value === undefined) {
  throwPageError(error.value, route.path)
}

// Step 1 is done: ask the route again, which now answers with the Student's
// e-mail, their Billing Details and any refusal their session brings with it,
// without a page change. That answer is also what mounts step 2.
async function onLoggedIn(): Promise<void> {
  await refreshCheckout()
  if (error.value !== undefined && refusal.value === undefined) {
    showError(error.value)
  }
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

.aside {
  @media (--md-n-above) {
    position: sticky;
    inset-block-start: var(--space-4);
  }
}
</style>
