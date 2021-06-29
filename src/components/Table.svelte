<script>
  import { coinStore } from "../store/stores";
  import Modal from "./Modal.svelte";
  import { Circle2 } from "svelte-loading-spinners";

  const valorsColumnes = ["symbol", "priceChangePercent", "lastPrice"];
  const limitPercentatge = 0;
  let changeBooleanIsOpenInModal;
  let modalComponent;
  let moneda = [];

  //Modal
  changeBooleanIsOpenInModal = function (value) {
    moneda = value;
    modalComponent.open();
  };
</script>

<!-- Taula -->
<table class="taulaPrincipal">
  <tbody>
    <td class="nomCella" />
    {#each $coinStore as row}
      <tr
        on:click|preventDefault={changeBooleanIsOpenInModal(row)}
        class={row[valorsColumnes[1]] >= limitPercentatge
          ? "majorHover"
          : "menorHover"}
      >
        <td class="nomCella">{row[valorsColumnes[0]]}</td>
        <td
          class={row[valorsColumnes[1]] >= limitPercentatge ? "major" : "menor"}
        >
          {parseFloat(row[valorsColumnes[1]]).toFixed(2)}
        </td>
        <td class="percentatgeCella">{row[valorsColumnes[2]]}</td>
      </tr>
    {:else}
      <tr>
        <td />
        <div class="loading">
          <div class="loadingLoad">
            <Circle2 size="100" unit="px" />
          </div>
        </div>
        <td />
      </tr>
    {/each}
    <td />
  </tbody>
  <svelte:component this={Modal} {moneda} bind:this={modalComponent} />
</table>
