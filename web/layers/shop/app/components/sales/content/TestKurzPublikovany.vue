<template>
  <div class="sales-content p-flow">
    <section class="block p-flow">
      <h2>Pro koho kurz je</h2>
      <ul class="questions">
        <li>Máte doma dítě, které u&nbsp;jídla vybírá, odmítá nebo se s&nbsp;vámi dohaduje?</li>
        <li>Chcete přestat u&nbsp;stolu bojovat a&nbsp;přitom vědět, že dítě jí dobře?</li>
        <li>Hledáte postup, který funguje v&nbsp;běžném dni, ne jen na papíře?</li>
      </ul>
      <p class="conclusion">
        Kurz je pro rodiče, kteří chtějí dítěti vybudovat zdravý vztah k&nbsp;jídlu bez diet, bez
        nátlaku a&nbsp;bez speciálních potravin. Hodí se pro rodiny s&nbsp;dětmi od batolat po první
        stupeň.
      </p>
    </section>

    <section class="block p-flow">
      <h2>Co v&nbsp;kurzu získáte</h2>
      <ul class="check-list">
        <li>Srozumitelně vysvětlené zásady dětské výživy od nutriční poradkyně</li>
        <li>
          Postup, jak zavádět nové potraviny a&nbsp;nezkazit si u&nbsp;toho s&nbsp;dítětem vztah
        </li>
        <li>Konkrétní věty a&nbsp;reakce na situace, které u&nbsp;stolu zažíváte každý den</li>
        <li>Recepty a&nbsp;praktické tipy do kuchyně, které zvládnete i&nbsp;ve všední den</li>
      </ul>
    </section>

    <section class="block p-flow">
      <h2>Jak kurz probíhá</h2>
      <ol class="steps">
        <li>
          <strong>Sledujete videa vlastním tempem.</strong> Každá lekce je krátká a&nbsp;dá se
          zhlédnout večer po uspání dětí.
        </li>
        <li>
          <strong>Zkoušíte doma.</strong> K&nbsp;lekcím patří texty a&nbsp;pracovní listy, se
          kterými poznatky převedete do praxe u&nbsp;vlastního stolu.
        </li>
        <li>
          <strong>Vracíte se, kdykoli potřebujete.</strong> Přístup ke kurzu zůstává, takže se
          k&nbsp;lekcím vrátíte, až dítě povyroste a&nbsp;přijdou nové situace.
        </li>
      </ol>
    </section>
  </div>
</template>

<script lang="ts" setup>
// Only persuasion lives here: the Sales Page skeleton owns the cover, title,
// teaser, price, outline and button, and a price typed into this copy is a
// defect.
</script>

<style scoped>
.sales-content {
  --flow-space: var(--space-8);
  max-width: var(--size-content-2);
}

.block {
  --flow-space: var(--space-4);
}

.questions,
.check-list,
.steps {
  list-style: none;
  padding-inline-start: 0;
}

.questions li,
.check-list li,
.steps li {
  position: relative;
  padding-inline-start: var(--space-6);
  margin-block-end: var(--space-3);
}

.questions li::before,
.check-list li::before,
.steps li::before {
  position: absolute;
  inset-inline-start: 0;
  font-weight: var(--font-weight-7);
}

.questions li {
  font-size: var(--font-size-1);
}

.questions li::before {
  content: "?";
  color: var(--color-burgundy-red);
  font-size: var(--font-size-2);
  line-height: 1;
}

.check-list li::before {
  content: "✓";
  color: var(--color-forest-green);
}

.steps {
  counter-reset: step;
}

.steps li {
  counter-increment: step;
}

.steps li::before {
  content: counter(step) ".";
  color: var(--color-burgundy-red);
}

.conclusion {
  padding: var(--space-5);
  background-color: var(--color-peach);
  border-radius: var(--radius-3);
  text-wrap: pretty;
}
</style>
