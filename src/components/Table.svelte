<script>
  import { onDestroy } from "svelte";
  import { coinStore } from "../store/stores";
  import Modal from "./Modal.svelte";

  let coins = [];
  let modificadorOrdre;
  let ordrePer;
  let changeBooleanIsOpenInModal;
  let modalComponent;
  let desktop = 600;
  let limitPercentatge = 0;
  let moneda = [];
  let primeraColumna = "nom";
  let segonaColumna = "Price change percent";
  let segonaColumnaMobile = "24h %";
  let terceraColumna = "Last price";

  //Subscripció a l'store.
  const unsubscribe = coinStore.subscribe((value) => {
    coins = value;
  });

  //Cancel·lar subscripció al tancar.
  onDestroy(unsubscribe);

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
</script>

<!-- Taula -->
<table class="taulaPrincipal">
  <thead>
    <tr>
      <th class="nom-th" on:click={sort("symbol")}>{primeraColumna}</th>
      <th class="percent-th" on:click={sort("priceChangePercent")}>
        {#if window.screen.width < desktop}
          {segonaColumnaMobile}
        {:else}
          {segonaColumna}
        {/if}
      </th>
      <th class="preu-th" on:click={sort("lastPrice")}>{terceraColumna}</th>
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
