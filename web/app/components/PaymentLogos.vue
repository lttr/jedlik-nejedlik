<template>
  <div class="payment-logos">
    <p class="payment-heading">Přijímáme platby</p>
    <div class="payment-logos-images">
      <img src="/images/payment/gopay.png" alt="GoPay" />
      <img src="/images/payment/visa.png" alt="Visa" />
      <img
        src="/images/payment/mastercard.png"
        alt="Mastercard"
        class="mastercard"
      />
    </div>
  </div>
</template>

<style scoped>
.payment-logos {
  text-align: center;
}

.payment-heading {
  font-size: var(--font-size--1);
  margin-bottom: var(--space-2);
}

.payment-logos-images {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);
}

.payment-logos-images img {
  background-color: white;
  border-radius: var(--radius-2);
  padding: var(--space-2);
}

.mastercard {
  scale: 0.8;
}
</style>
