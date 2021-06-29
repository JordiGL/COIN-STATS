<script>
  import "../../public/global.css";
  import Popup from "svelte-atoms/Popup.svelte";

  const close = () => (isOpen = false);
  export let isOpen = false;
  export let moneda = [];
  export function open() {
    isOpen = true;
  }
  let propietatsDescartables = [
    "openTime",
    "closeTime",
    "firstId",
    "lastId",
    "count",
  ];
  let nomColumnes = [
    "Symbol",
    "Price Change",
    "Price change %",
    "Weighted avg",
    "Previous close",
    "Last price",
    "Last quantity",
    "Bid price",
    "Bid quantity",
    "Ask Price",
    "Ask quantity",
    "Open price",
    "High price",
    "Low price",
    "Volume",
    "Quote volume",
  ];
</script>

<Popup {isOpen} on:close={close}>
  <span class="closePopup" on:click={close}>X</span>
  <table class="popupTable">
    <tbody>
      {#each Object.entries(moneda) as [key], index}
        {#if !propietatsDescartables.includes(key)}
          <td>
            <div>{nomColumnes[index]}:</div>
            <div class="popUpValue">{moneda[key]}</div>
          </td>
          {#if (index + 1) % 2 == 0}
            <tr />
          {/if}
        {/if}
      {/each}
    </tbody>
  </table>
</Popup>
