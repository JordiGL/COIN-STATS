<script>
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faSearchDollar } from "@fortawesome/free-solid-svg-icons";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onDestroy } from "svelte";
  import { coinStore, url } from "../store/stores";

  let coins;
  let modificadorOrdre;
  let ordrePer;
  let ordrePerpercentatge = false;
  let posts = [];
  let response;
  let valorACercar;

  //Subscripció a l'store.
  const unsubscribe = coinStore.subscribe((value) => {
    coins = value;
  });

  onMount(async () => {
    response = await fetch(url);
    posts = await response.json();
    coinStore.set(posts);
  });
  //Inicialitzador de l'ordre de la columna.
  ordrePer = { defecte: "priceChangePercent", ascending: true };

  //Ascendent o descendent.
  $: sort = (columna) => {
    if (ordrePer.defecte == columna) {
      ordrePer.ascending = !ordrePer.ascending;
    } else {
      ordrePer.defecte = columna;
      ordrePer.ascending = true;
    }

    // Modificació de l'ordre de la columna, ascendent o descendent.
    modificadorOrdre = ordrePer.ascending ? 1 : -1;
    if (columna === "symbol") {
      sort = (a, b) =>
        a[columna] < b[columna]
          ? -1 * modificadorOrdre
          : a[columna] > b[columna]
          ? 1 * modificadorOrdre
          : a[columna] < b[columna];
    } else if (columna === "priceChangePercent") {
      sort = (a, b) =>
        Number(a[columna]) < Number(b[columna])
          ? -1 * modificadorOrdre
          : Number(a[columna]) > Number(b[columna])
          ? 1 * modificadorOrdre
          : 0;
    } else {
      sort = (a, b) =>
        Number(a[columna]) < Number(b[columna])
          ? -1 * modificadorOrdre
          : Number(a[columna]) > Number(b[columna])
          ? 1 * modificadorOrdre
          : 0;
    }
    coins = coins.sort(sort);
  };

  //Funció per a refrescar la taula
  async function refrescar() {
    response = await fetch(url);
    posts = await response.json();
    coinStore.set(posts);
  }

  //Funció per a fer la cerca.
  async function cercar() {
    coinStore.update((valor) => {
      coins = valor;
      return coins;
    });

    coins = coins.filter((element) =>
      element.symbol.includes(valorACercar.toUpperCase())
    );
  }

  //Cancel·lar subscripció al tancar.
  onDestroy(unsubscribe);
</script>

<!-- Header que conté el títol, el botó per a refrescar el contingut de la taula i el cercador -->
<div class="container">
  <div class="title">COIN STATS</div>
  <div class="cercar">
    <button on:click={refrescar}><Fa icon={faSync} /></button>
    <input
      type="text"
      placeholder="Cercar..."
      name="search"
      bind:value={valorACercar}
    />
    <button type="submit" on:click={cercar}><Fa icon={faSearchDollar} /></button
    >
  </div>
</div>

<!-- Taula -->
<table>
  <thead>
    <tr>
      <th on:click={sort("symbol")}>Nom</th>
      <th on:click={(sort("priceChangePercent"), (ordrePerpercentatge = true))}>
        Percentatge
      </th>
      <th on:click={sort("lastPrice")}>Valor</th>
    </tr>
  </thead>
  <tbody>
    {#each coins as row}
      <tr class={row.priceChangePercent >= 0 ? "majorHover" : "menorHover"}>
        <td>{row.symbol}</td>
        <td class={row.priceChangePercent >= 0 ? "major" : "menor"}>
          {parseFloat(row.priceChangePercent).toFixed(2)}
        </td>
        <td>{row.lastPrice}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .container {
    margin: none;
  }
  .title {
    height: 44px;
    font-size: xx-large;
    float: left;
  }

  .cercar {
    float: right;
  }

  table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  table th {
    padding: 15px;
  }

  table tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  table th {
    text-align: center;
    background-color: #424242;
    color: white;
  }
  td {
    padding: 15px;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .menor {
    color: red;
  }

  .major {
    color: green;
  }
  .menorHover:hover {
    background-color: rgb(255, 244, 244);
  }

  .majorHover:hover {
    background-color: rgb(244, 255, 244);
  }
</style>
