<script>
  import { coinStore } from "../store/stores";
  import Modal from "./Modal.svelte";
  import { sortOn } from "../gestor/utils";

  const nomColumnes = ["Nom", "Price change percent", "24h %", "Last price"];
  const valorsColumnes = ["symbol", "priceChangePercent", "lastPrice"];
  const desktop = 600;
  const limitPercentatge = 0;
  let changeBooleanIsOpenInModal;
  let modalComponent;
  let moneda = [];
  let ascendent = true;

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
      coinStore.set(sortOn(Object.values($coinStore), option, ascendent));
      ascendent = true;
    }
  }
</script>

<!-- Taula -->
<table class="taulaPrincipal">
  <thead>
    <tr>
      <th class="nom-th" on:click={() => coinsSort(valorsColumnes[0])}
        >{nomColumnes[0]}</th
      >
      <th class="percent-th" on:click={() => coinsSort(valorsColumnes[1])}>
        {#if window.screen.width < desktop}
          {nomColumnes[2]}
        {:else}
          {nomColumnes[1]}
        {/if}
      </th>
      <th class="preu-th" on:click={() => coinsSort(valorsColumnes[2])}
        >{nomColumnes[3]}</th
      >
    </tr>
  </thead>
  <tbody>
    {#each $coinStore as row}
      <tr
        on:click|preventDefault={changeBooleanIsOpenInModal(row)}
        class={row[valorsColumnes[1]] >= limitPercentatge
          ? "majorHover"
          : "menorHover"}
      >
        <td>{row[valorsColumnes[0]]}</td>
        <td
          class={row[valorsColumnes[1]] >= limitPercentatge ? "major" : "menor"}
        >
          {parseFloat(row[valorsColumnes[1]]).toFixed(2)}
        </td>
        <td>{row[valorsColumnes[2]]}</td>
      </tr>
    {/each}
    <td />
  </tbody>
  <svelte:component this={Modal} {moneda} bind:this={modalComponent} />
</table>
