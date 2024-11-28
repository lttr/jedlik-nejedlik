<template>
  <PageWrapper>
    <article class="prose">
      <h1>O nás</h1>
      <p>
        Jedlík-nejedlík je nezisková organizace, která vznikla v roce 2023 jako
        vyústění soukromých i pracovních aktivit zakladatelky Zdeňky Trummové,
        které rozvíjela od roku 2017. Zdeňka je celoživotně aktivní skaut a
        původní profesí pedagog. Od útlého dětství bojovala s vlastní obezitou.
        Když během výkonu učitelského povolání viděla, kolik dětí a rodin se
        potýká se stejným problémem jako ona, rozhodla se být aktivní v rámci
        prevence dětské nadváhy a obezity na lokální úrovni. Jak se ze záliby
        stal společensky prospěšný projekt a pedagog se profesionalizoval v
        oboru nutrice, se dočtete <NuxtLink to="/zdenka">ZDE</NuxtLink>.
      </p>

      <h2>Jedlík-nejedlík působí na 3 základních úrovních</h2>

      <h3>Veřejně prospěšná osvětová činnost</h3>
      <p>
        Osvěta je pro nás důležitá. Zhruba čtvrtina naší práce představuje
        přednáškovou činnost, která poskytuje veřejnosti relevantní informace o
        výživě a výchově. Tyto přednášky mají zejména edukativní a preventivní
        charakter. Více naleznete v sekci
        <NuxtLink to="/akce">Akce</NuxtLink>.
      </p>
      <p v-if="presentation1">
        <ContentImg :image="presentation1" />
      </p>

      <h3>Soukromá poradna Jedlík-nejedlík</h3>
      <p>
        V naší soukromé poradně poskytujeme individuální odborné poradenství
        zejména rodičům, kteří potřebují podporu na cestě za zdravým životním
        stylem jejich dětí. Pracujeme s dětmi, které mají nadváhu, obezitu, ale
        i s dětmi s podvýživou nebo těmi, které mají problém s přijímáním
        potravy. Poradenství probíhá osobně nebo online. Více informací o našich
        službách najdete <NuxtLink to="/pro-rodice">ZDE</NuxtLink>.
      </p>
      <p v-if="presentation2">
        <ContentImg :image="presentation2" />
      </p>

      <h3>Odborná činnost</h3>
      <p>
        Osvětu šíříme také mezi odborníky, a to zejména o problematice výživy a
        výchovy v propojení. Pomáháme odborníkům rozšiřovat obzory a ukazovat
        jim důležitost komplexního a laskavého přístupu k rodinám. Jsme členy
        několika pracovních odborných skupin, pro které je mezioborová
        spolupráce důležitá. Jste odborník? Více informací o naší odborné
        činnosti najdete <NuxtLink to="/pro-odborniky">ZDE</NuxtLink>.
      </p>
      <p v-if="presentation3">
        <ContentImg :image="presentation3" />
      </p>
    </article>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { data: presentation1 } = await useDirectusImage(
  "658ad6bf-386d-4d5c-bb6c-1f0206930f5a",
)

const { data: presentation2 } = await useDirectusImage(
  "48abd94b-5c30-471d-859d-a2bd43f462a1",
)

const { data: presentation3 } = await useDirectusImage(
  "212768cd-d1c1-4dc6-a1c8-a121a69efb2c",
)
</script>

<style scoped></style>
