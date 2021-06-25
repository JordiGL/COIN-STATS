<script>
  import "../../public/global.css";
  import Popup from "svelte-atoms/Popup.svelte";

  let percentatgePopupMobile = "Price change %: ";
  let percentatgePopup = "Price change percent: ";
  let weightAveragePopupMobile = "Weighted avg: ";
  let weightAveragePopup = "Weighted average: ";
  let desktop = 600;
  const close = () => (isOpen = false);
  export let isOpen = false;
  export let moneda = [];
  export function open() {
    isOpen = true;
  }
</script>

<Popup {isOpen} on:close={close}>
  <span class="closePopup" on:click={close}>X</span>
  <table class="popupTable">
    <tbody>
      <tr>
        <td>
          <div>Coin:</div>
          <div class="popUpValue">{moneda.symbol}</div>
        </td>
        <td>
          <div>Last price:</div>
          <div class="popUpValue">{moneda.lastPrice}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>Open price:</div>
          <div class="popUpValue">{moneda.openPrice}</div>
        </td>
        <td>
          <div>Previous close:</div>
          <div class="popUpValue">{moneda.prevClosePrice}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>Price change:</div>
          <div class="popUpValue">{moneda.priceChange}</div>
        </td>
        <td>
          {#if window.screen.width < desktop}
            <div>{percentatgePopupMobile}</div>
          {:else}
            <div>{percentatgePopup}</div>
          {/if}
          <div class="popUpValue">
            {parseFloat(moneda.priceChangePercent).toFixed(2)}%
          </div>
        </td>
      </tr>
      <tr>
        <td>
          {#if window.screen.width < desktop}
            <div>{weightAveragePopupMobile}</div>
          {:else}
            <div>{weightAveragePopup}</div>
          {/if}
          <div class="popUpValue">{moneda.weightedAvgPrice}</div>
        </td>
        <td>
          <div>Last quantity:</div>
          <div class="popUpValue">{moneda.lastQty}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>Bid price:</div>
          <div class="popUpValue">{moneda.bidPrice}</div>
        </td>

        <td>
          <div>Bid quantity:</div>
          <div class="popUpValue">{moneda.bidQty}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>Ask Price:</div>
          <div class="popUpValue">{moneda.askPrice}</div>
        </td>

        <td>
          <div>Ask quantity:</div>
          <div class="popUpValue">{moneda.askQty}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>High price:</div>
          <div class="popUpValue">{moneda.highPrice}</div>
        </td>
        <td>
          <div>Low price:</div>
          <div class="popUpValue">{moneda.lowPrice}</div></td
        >
      </tr>
      <tr>
        <td>
          <div>Volume:</div>
          <div class="popUpValue">{moneda.volume}</div></td
        >
        <td>
          <div>Quote volume:</div>
          <div class="popUpValue">{moneda.quoteVolume}</div>
        </td>
      </tr>
    </tbody>
  </table>
</Popup>
