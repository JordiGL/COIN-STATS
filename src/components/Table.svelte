<script>
  import { coinStore } from "../store/stores";
  import Modal from "./Modal.svelte";
  import { sortOn } from "../gestor/utils";

  let changeBooleanIsOpenInModal;
  let modalComponent;
  let desktop = 600;
  let limitPercentatge = 0;
  let moneda = [];
  let primeraColumna = "Nom";
  let segonaColumna = "Price change percent";
  let segonaColumnaMobile = "24h %";
  let terceraColumna = "Last price";
  let ascendent = true;
  let descendent = false;

  //Modal
  changeBooleanIsOpenInModal = function (value) {
    moneda = value;
    modalComponent.open();
  };

  //Funció per ordenar columnes
  function coinsSort(option) {
    if (ascendent) {
      coinStore.set(sortOn(Object.values($coinStore), option, ascendent));
      ascendent = false;
    } else {
      coinStore.set(sortOn(Object.values($coinStore), option, descendent));
      ascendent = true;
    }
  }
</script>

<!-- Taula -->
<table class="taulaPrincipal">
  <thead>
    <tr>
      <th class="nom-th" on:click={() => coinsSort(primeraColumna, true)}
        >{primeraColumna}</th
      >
      <th class="percent-th" on:click={() => coinsSort(segonaColumna, true)}>
        {#if window.screen.width < desktop}
          {segonaColumnaMobile}
        {:else}
          {segonaColumna}
        {/if}
      </th>
      <th class="preu-th" on:click={() => coinsSort(terceraColumna, true)}
        >{terceraColumna}</th
      >
    </tr>
  </thead>
  <tbody>
    {#each $coinStore as row}
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
