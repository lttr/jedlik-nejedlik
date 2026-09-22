<template>
  <div class="billing">
    <div class="p-form-group">
      <label :for="`${idPrefix}-name`">Jméno a&nbsp;příjmení (na&nbsp;doklad)</label>
      <input
        :id="`${idPrefix}-name`"
        v-model="details.billing_name"
        :maxlength="BILLING_FIELD_MAX_LENGTH"
        type="text"
        name="billingName"
        autocomplete="name"
      />
    </div>

    <details class="company" :open="companyOpen">
      <summary>Chci doklad na&nbsp;firmu nebo s&nbsp;adresou</summary>

      <div class="company-fields">
        <div class="p-form-group">
          <label :for="`${idPrefix}-company`">Firma</label>
          <input
            :id="`${idPrefix}-company`"
            v-model="details.billing_company"
            :maxlength="BILLING_FIELD_MAX_LENGTH"
            type="text"
            name="billingCompany"
            autocomplete="organization"
          />
        </div>

        <div class="p-form-group">
          <label :for="`${idPrefix}-ic`">IČO</label>
          <input
            :id="`${idPrefix}-ic`"
            v-model="details.billing_ic"
            :maxlength="BILLING_FIELD_MAX_LENGTH"
            type="text"
            name="billingIc"
            inputmode="numeric"
          />
        </div>

        <div class="p-form-group">
          <label :for="`${idPrefix}-street`">Ulice a&nbsp;číslo popisné</label>
          <input
            :id="`${idPrefix}-street`"
            v-model="details.billing_street"
            :maxlength="BILLING_FIELD_MAX_LENGTH"
            type="text"
            name="billingStreet"
            autocomplete="street-address"
          />
        </div>

        <div class="town">
          <div class="p-form-group">
            <label :for="`${idPrefix}-city`">Město</label>
            <input
              :id="`${idPrefix}-city`"
              v-model="details.billing_city"
              :maxlength="BILLING_FIELD_MAX_LENGTH"
              type="text"
              name="billingCity"
              autocomplete="address-level2"
            />
          </div>

          <div class="p-form-group">
            <label :for="`${idPrefix}-zip`">PSČ</label>
            <input
              :id="`${idPrefix}-zip`"
              v-model="details.billing_zip"
              :maxlength="BILLING_FIELD_MAX_LENGTH"
              type="text"
              name="billingZip"
              autocomplete="postal-code"
              inputmode="numeric"
            />
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<script lang="ts" setup>
import { BILLING_FIELD_MAX_LENGTH, hasBillingCompanyDetails } from "../../../shared/utils/checkout"
import type { BillingDetails } from "../../../shared/utils/checkout"

// The Billing Details, wherever they are being edited: step 2 of the Checkout
// and „Fakturační údaje" on the Account page. It renders fields and nothing
// else — no heading, no submit button, no saving — so each page can put its
// own copy around it and decide what pressing something means.
//
// Every field is optional on purpose: a name is never a wall between a Student
// and a Course (spec, user story 9).
const details = defineModel<BillingDetails>({ required: true })

// Two of these on one page would otherwise share `id`s and their labels would
// point at the wrong inputs.
const { idPrefix = "billing" } = defineProps<{
  idPrefix?: string
}>()

// Collapsed by default, but not over something already filled in: a Student
// whose Account carries a company would otherwise have to go looking for it.
// Read once, so opening or closing it by hand afterwards sticks.
const companyOpen = hasBillingCompanyDetails(details.value)
</script>

<style scoped>
.billing {
  display: grid;
  gap: var(--space-4);
}

/* Puleo (`@lttr/puleo`, the site's CSS library) gives every `details` a
   surface and the site's pill radius, which around a block of inputs reads as
   a stray blob rather than a panel. */
.company,
.company summary {
  margin: 0;
  padding: 0;
  background: none;
  border-radius: 0;
}

.company summary {
  cursor: pointer;
  color: var(--text-color-2);
}

.company-fields {
  display: grid;
  gap: var(--space-4);
  margin-block-start: var(--space-4);
}

.town {
  display: grid;
  gap: var(--space-4);

  @media (--sm-n-above) {
    grid-template-columns: 2fr 1fr;
  }
}
</style>
