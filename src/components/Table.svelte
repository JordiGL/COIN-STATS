<script>
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onDestroy } from "svelte";
  import { coinStore, url } from "../store/stores";
  import Header from "./Header.svelte";
  import Modal from "./Modal.svelte";

  let coins;
  let modificadorOrdre;
  let ordrePer;
  let ordrePerpercentatge = false;
  let posts = [];
  let response;
  let percentatge = "Price change percent";
  let percentatgeMobile = "24h %";
  let changeBooleanIsOpenInModal;
  let modalComponent;
  let desktop = 600;
  let limitPercentatge = 0;
  let timer;
  let moneda = [];

  //Subscripció a l'store.
  const unsubscribe = coinStore.subscribe((value) => {
    coins = value;
  });

  //Càrrega de dades en iniciar.
  onMount(async () => {
    response = await fetch(url);
    posts = await response.json();
    coinStore.set(posts);
  });

  //Modal
  changeBooleanIsOpenInModal = function (value) {
    moneda = value;
    modalComponent.open();
  };

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
  async function cercar(valorACercar) {
    coinStore.update((valor) => {
      coins = valor;
      return coins;
    });

    clearTimeout(timer);
    timer = setTimeout(() => {
      coins = coins.filter((element) =>
        element.symbol.includes(valorACercar.toUpperCase())
      );
    }, 750);
  }
  //Cancel·lar subscripció al tancar.
  onDestroy(unsubscribe);
</script>

<!-- Header que conté el títol, el botó per a refrescar el contingut de la taula i el cercador -->
<div class="container">
  <Header title="Coin stats" />
  <div class="cercar">
    <button on:click={refrescar}><Fa icon={faSync} /></button>
    <input
      class="cercador"
      placeholder="Search..."
      on:keyup={({ target: { value } }) => cercar(value)}
    />
  </div>
</div>

<!-- Taula -->
<table class="taulaPrincipal">
  <thead>
    <tr>
      <th class="nom-th" on:click={sort("symbol")}>Name</th>
      <th
        class="percent-th"
        on:click={(sort("priceChangePercent"), (ordrePerpercentatge = true))}
      >
        {#if window.screen.width < desktop}
          {percentatgeMobile}
        {:else}
          {percentatge}
        {/if}
      </th>
      <th class="preu-th" on:click={sort("lastPrice")}>Last price</th>
    </tr>
  </thead>
  <tbody>
    {#each coins as row}
      <tr
        on:click|preventDefault={changeBooleanIsOpenInModal(row)}
        class={row.priceChangePercent >= limitPercentatge
          ? "majorHover"
          : "menorHover"}
      >
        <td>{row.symbol}</td>
        <td
          class={row.priceChangePercent >= limitPercentatge ? "major" : "menor"}
        >
          {parseFloat(row.priceChangePercent).toFixed(2)}
        </td>
        <td>{row.lastPrice}</td>
      </tr>
    {/each}
    <td />
  </tbody>
  <svelte:component this={Modal} {moneda} bind:this={modalComponent} />
</table>
