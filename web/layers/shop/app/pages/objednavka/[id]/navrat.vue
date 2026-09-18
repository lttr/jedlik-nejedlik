<template>
  <PageWrapper>
    <div v-if="view" class="settlement p-flow">
      <h1 class="p-heading-3">{{ HEADINGS[view.state] }}</h1>

      <!-- The title is empty for a Course the Student may no longer read, and
           both sentences are written to stand without it: the surrounding
           whitespace collapses, so „Kurz máte od teď k dispozici" is what is
           left rather than a gap. -->
      <ShopNotice v-if="view.state === 'paid'" tone="success">
        Platba dorazila. Kurz <strong>{{ view.courseTitle }}</strong> máte od&nbsp;teď
        k&nbsp;dispozici.
      </ShopNotice>
      <ShopNotice v-else-if="view.state === 'failed'">
        Platba za&nbsp;kurz <strong>{{ view.courseTitle }}</strong> nebyla dokončena. Z&nbsp;účtu
        vám nic nestrhli.
      </ShopNotice>
      <p v-else role="status">{{ pendingMessage }}</p>

      <p>
        <NuxtLink :to="onward.to" class="p-button p-button-brand">{{ onward.label }}</NuxtLink>
      </p>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
import { checkoutPath } from "../../../../shared/utils/pending-checkout"
import type { SettlementState, SettlementView } from "../../../../shared/utils/settlement"

// Where GoPay sends the Student back. The route settles the Payment on the
// way, so this page only reports an outcome — it never grants anything itself
// (spec, user story 25).
definePageMeta({ middleware: "auth" })

// The Student can beat GoPay's notification by seconds, so a pending Payment
// is asked about again for half a minute before they are sent on their way
// (spec, user story 17).
const REFRESH_INTERVAL_MS = 3000
const REFRESH_LIMIT_MS = 30_000

const HEADINGS: Record<SettlementState, string> = {
  paid: "Kurz je váš",
  pending: "Čekáme na potvrzení platby",
  failed: "Platba neproběhla",
}

const route = useRoute()
const orderId = String(route.params.id)

const {
  data: view,
  error,
  refresh,
} = await useFetch<SettlementView>(`/api/orders/${orderId}/settlement`, {
  key: `settlement:${orderId}`,
})

// No session, or somebody else's Order: the site's error page, so one Student
// cannot use this page to find out that another's Order exists.
if (error.value !== undefined) {
  throwPageError(error.value, route.path)
}

// True while the page is still re-asking; false once it has given up and
// tells the Student where the Course will turn up instead. Written once, by
// the limit below.
const waiting = ref(view.value?.state === "pending")

// Non-breaking spaces as characters, not entities: this is text, not markup.
const pendingMessage = computed(() =>
  waiting.value
    ? "Jakmile banka platbu potvrdí, kurz se otevře. Chvilku to může trvat, stránka se sama obnoví."
    : "Jakmile platba dorazí, najdete kurz v Mém účtu v sekci „Moje kurzy“. Tady už čekat nemusíte.",
)

// „Zkusit znovu" needs a Checkout to go back to, so it is offered only for a
// failed Payment whose Course is still readable; the Account page is the way
// onward for everything else.
const retrySlug = computed(() => (view.value?.state === "failed" ? view.value.courseSlug : ""))

const onward = computed(() =>
  retrySlug.value === ""
    ? { to: "/muj-ucet", label: "Moje kurzy" }
    : { to: checkoutPath(retrySlug.value), label: "Zkusit znovu" },
)

// Two timers, both VueUse's, so there is one answer to „when does this stop
// polling": the poll stops itself the moment the Payment is no longer pending,
// and the limit stops it for good half a minute in. Both are started on mount,
// because neither belongs on the server.
const { pause: stopPolling, resume: startPolling } = useIntervalFn(
  async () => {
    await refresh()
    if (view.value?.state !== "pending") {
      stopPolling()
    }
  },
  REFRESH_INTERVAL_MS,
  { immediate: false },
)

const { start: startLimit } = useTimeoutFn(
  () => {
    stopPolling()
    waiting.value = false
  },
  REFRESH_LIMIT_MS,
  { immediate: false },
)

onMounted(() => {
  if (waiting.value) {
    startPolling()
    startLimit()
  }
})

useSeoMeta({ title: "Platba za kurz", robots: "noindex, nofollow" })
</script>

<style scoped>
.settlement {
  max-width: var(--size-content-2);
}
</style>
