<template>
  <div class="p-page-layout">
    <h1>Výživa a výchova v propojení</h1>
    <p>
      Milí odborníci, vítejte na stránkách projektu i poradny Jedlík-nejedlík.
      Bližší informace o soukromé poradně naleznete
      <NuxtLink to="/o-nas">zde</NuxtLink>. V této sekci vás chceme seznámit s
      hlavní misí celého projektu.
    </p>

    <section class="p-flow">
      <h2>S kým spolupracujeme</h2>
      <p>
        Zabýváte se tématem dětské výživy, psychologie či výchovy? Patříte mezi
        odborníky a máte pocit, že by naše spolupráce mohla být prospěšná dětem
        a rodičům nebo vzájemně obohacující? Líbí se vám naše práce a chtěli
        byste nás na vaší akci? Spojte se s námi prostřednictvím kontaktního
        formuláře, ozveme se vám.
      </p>

      <CooperationForm />

      <p>
        Jste v oboru začátečník nebo teprve dokončujete studia? Pokud vám jde o
        stejné hodnoty, není to překážka. Všichni jsme někdy začínali. Pro
        Jedlíka-nejedlíka není podstatné, kolik toho víte nebo kolik děláte
        chyb, ale to, jestli chybu umíte přiznat, poučit se z ní a lidsky či
        odborně na ni vyrůst. Kvalita a odbornost je pro nás zásadní, nikdy ale
        nechceme pod tíhou titulů zpychnout. Jedlík-nejedlík staví na hodnotách
        lidskosti, laskavosti a přijetí, ať už směrem k rodičům nebo odborníkům.
      </p>

      <h2>S kým nespolupracujeme</h2>

      <p>
        Pokud vás láká s námi spolupracovat, ale výše uvedené na vás nesedí,
        ušetříte mnoho času a energie oběma stranám, když nás nebudete ohledně
        spolupráce kontaktovat. Dále upozorňujeme, že nejsme prodejci doplňků
        stravy a nemáme zájem se jimi stát.
      </p>

      <h2>Odborníci, kteří projektu Jedlík-nejedlík věří a podporují nás</h2>
      <ul>
        <li>Soňa Procházková</li>
        <li>Soňa Procházková</li>
        <li>Soňa Procházková</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.p-page-layout {
  row-gap: var(--space-7);
  margin-bottom: var(--space-7);
}
</style>
