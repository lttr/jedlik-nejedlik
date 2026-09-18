<template>
  <PageWrapper>
    <div class="gateway p-flow">
      <h1 class="p-heading-3">Testovací platební brána</h1>
      <p class="p-secondary-text-regular">
        Tohle není GoPay. Stránka běží jen ve&nbsp;vývoji a zastupuje platební bránu.
      </p>

      <p v-if="payment === null" class="error-message" role="alert">
        Tuhle platbu brána nezná. Vznikla nejspíš před restartem serveru.
      </p>

      <template v-else>
        <dl class="summary">
          <dt>Kurz</dt>
          <dd>{{ payment.courseTitle }}</dd>
          <dt>Částka</dt>
          <dd>
            <strong>{{ formatPriceCzk(payment.priceCzk) }}</strong>
          </dd>
          <dt>Objednávka</dt>
          <dd>{{ payment.orderId }}</dd>
          <dt>Plátce</dt>
          <dd>{{ payment.payerEmail }}</dd>
          <dt>Platba</dt>
          <dd>{{ payment.id }}</dd>
        </dl>

        <form v-if="isPaymentLive(payment.state)" class="actions" method="post" :action="decideUrl">
          <button class="p-button p-button-brand" name="action" value="pay" type="submit">
            Zaplatit
          </button>
          <button class="p-button" name="action" value="cancel" type="submit">Zrušit</button>
        </form>
        <p v-else class="success-message" role="status">
          Platba je ve&nbsp;stavu {{ payment.state }}. Rozhodnout se dá jen jednou.
        </p>
      </template>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { isPaymentLive } from "../../../../shared/utils/gopay"

// The developer's stand-in for GoPay's payment page (spec, „Mock gateway").
// The buttons post a plain form, so the flow works with JavaScript off and
// the same route can be called by a test.
const paymentId = String(useRoute().params.id)

const { data: payment } = await useFetch(`/api/gopay/mock/payments/${paymentId}`, {
  key: `gopay-mock:${paymentId}`,
  default: () => null,
})

const decideUrl = `/api/gopay/mock/payments/${paymentId}/decide`

useSeoMeta({ title: "Testovací platební brána", robots: "noindex, nofollow" })
</script>

<style scoped>
.gateway {
  max-width: 32rem;
  margin-inline: auto;
}

.summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-2) var(--space-4);
}

.summary dt,
.summary dd {
  /* The browser's own `dd` indent and the stylesheet's vertical rhythm both
     break the two columns apart. */
  margin: 0;
}

.summary dt {
  color: var(--text-color-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
