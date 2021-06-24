<script>
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onDestroy } from "svelte";
  import { coinStore, url } from "../store/stores";
  import Popup from "svelte-atoms/Popup.svelte";

  let coins;
  let modificadorOrdre;
  let ordrePer;
  let ordrePerpercentatge = false;
  let posts = [];
  let response;
  let percentatge = "Price change percent";
  let desktop = 600;
  let limitPercentatge = 0;
  let timer;
  let isOpen = false;
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

  //Popup
  const close = () => (isOpen = false);
  const open = (row) => ((isOpen = true), (moneda = row));

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
  <div class="title">COIN STATS</div>
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
          {(percentatge = "24h %")}
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
        on:click={open(row)}
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
  <Popup {isOpen} on:close={close}>
    <!-- <table class="popupTable">
      <tbody>
        <tr>
          <td>Coin: {moneda.symbol}</td>
          <td>Last price: {moneda.lastPrice}</td>
        </tr>
        <tr>
          <td>Open price: {moneda.openPrice}</td>
          <td>Previous close price: {moneda.prevClosePrice}</td>
        </tr>
        <tr>
          <td>Price change: {moneda.priceChange}</td>
          <td>Price change percent: {moneda.priceChangePercent}</td>
        </tr>
        <tr>
          <td>Weighted average price: {moneda.weightedAvgPrice}</td>
          <td>Last quantity: {moneda.lastQty}</td>
        </tr>
        <tr>
          <td>Bid price: {moneda.bidPrice}</td>
          <td>Bid quantity: {moneda.bidQty}</td>
        </tr>
        <tr>
          <td>Ask Price: {moneda.askPrice}</td>
          <td>Ask quantity: {moneda.askQty}</td>
        </tr>
        <tr>
          <td>High price: {moneda.highPrice}</td>
          <td>Low price: {moneda.lowPrice}</td>
        </tr>
        <tr>
          <td>Volume: {moneda.volume}</td>
          <td>Quote volume: {moneda.quoteVolume}</td>
        </tr>
      </tbody>
    </table> -->
    <table class="popupTable">
      <tbody>
        <tr>
          <td>Coin: {moneda.symbol}</td>
          <td>Last price: {moneda.lastPrice}</td>
        </tr>
        <tr>
          <td>Open price: {moneda.openPrice}</td>
          <td>Previous close: {moneda.prevClosePrice}</td>
        </tr>
        <tr>
          <td>Price change: {moneda.priceChange}</td>
          <td>Price change %: {moneda.priceChangePercent}</td>
        </tr>
        <tr>
          <td>Weighted average: {moneda.weightedAvgPrice}</td>
          <td>Last quantity: {moneda.lastQty}</td>
        </tr>
        <tr>
          {#if window.screen.width < desktop}
            <td>
              <div>Bid price:</div>
              <div>{moneda.bidPrice}</div>
            </td>
          {:else}
            <td>Bid price: {moneda.bidPrice}</td>
          {/if}
          <td>Bid quantity: {moneda.bidQty}</td>
        </tr>
        <tr>
          {#if window.screen.width < desktop}
            <td>
              <div>Ask Price:</div>
              <div>{moneda.askPrice}</div>
            </td>
          {:else}
            <td>Ask Price: {moneda.askPrice}</td>
          {/if}
          <td>Ask quantity: {moneda.askQty}</td>
        </tr>
        <tr>
          <td>High price: {moneda.highPrice}</td>
          <td>Low price: {moneda.lowPrice}</td>
        </tr>
        <tr>
          <td>Volume: {moneda.volume}</td>
          <td>Quote volume: {moneda.quoteVolume}</td>
        </tr>
        <tr>
          <td />
          <td class="closePopup"><b on:click={close}>X</b></td>
        </tr>
      </tbody>
    </table>
  </Popup>
</table>
<footer>
  <div>
    <a class="footer-text" href="https://www.twitter.com/realGoloSEO">
      Jordi Gómez Lozano - 2021
    </a>
  </div>
</footer>

<style>
  /* mobile */
  @media only screen and (max-width: 600px) {
    .container {
      position: fixed;
      background-color: white;
      width: 100%;
      height: 52px;
    }

    .title {
      float: left;
      font-size: 40px;
      margin-left: 10px;
      margin-top: 0px;
    }

    .cercar {
      float: right;
      margin-top: 8px;
      margin-right: 10px;
    }

    .cercador {
      width: 100px;
    }

    .taulaPrincipal {
      margin-top: 52px;
      font-family: Arial, Helvetica, sans-serif;
      width: 100%;
    }

    .percent-th {
      text-align: left;
      background-color: #424242;
      color: white;
      padding: 15px;
      resize: none;
      font-size: 14px;
      width: 20%;
    }

    .nom-th {
      text-align: left;
      background-color: #424242;
      color: white;
      padding: 15px;
      resize: none;
      font-size: 14px;
      width: 40%;
    }

    .preu-th {
      text-align: left;
      background-color: #424242;
      color: white;
      padding: 15px;
      resize: none;
      font-size: 14px;
      width: 40%;
    }

    .taulaPrincipal td {
      font-size: 14px;
      padding: 15px;
      text-align: left;
    }
  }

  /* desktop */
  @media only screen and (min-width: 600px) {
    .container {
      position: fixed;
      background-color: white;
      width: 100%;
      height: 75px;
    }

    .cercador {
      width: 200px;
    }
    .title {
      float: left;
      margin-top: 12px;
      font-size: 50px;
    }

    .cercar {
      float: right;
      margin-top: 28px;
      margin-right: 7px;
    }

    .taulaPrincipal {
      margin-top: 72px;
      font-family: Arial, Helvetica, sans-serif;
      width: 100%;
    }

    .taulaPrincipal th {
      text-align: center;
      background-color: #424242;
      color: white;
      padding: 15px;
      resize: none;
      width: 30%;
    }

    .taulaPrincipal td {
      padding: 15px;
      text-align: center;
    }
  }

  /* General */

  /* Popup */
  .popupTable {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  .popupTable tr {
    width: 50%;
  }

  /* .popupTable tr:nth-child(odd) {
    background-color: #f2f2f2;
  } */

  .popupTable tr td:nth-child(even) {
    padding-top: 10px;
    padding-left: 40px;
  }

  .popupTable tr td:nth-child(odd) {
    padding-top: 10px;
    padding-right: 10px;
    padding-left: 10px;
  }

  .closePopup {
    float: right;
  }

  /* Taula principal */

  .taulaPrincipal .menorHover:hover {
    background-color: rgb(255, 244, 244);
  }

  .taulaPrincipal .majorHover:hover {
    background-color: rgb(244, 255, 244);
  }

  .taulaPrincipal tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .menor {
    color: red;
  }

  .major {
    color: green;
  }

  .footer-text {
    color: white;
    font-size: 15px;
  }

  footer {
    position: fixed;
    background-color: #424242;
    bottom: 0;
    width: 100%;
    height: 25px;
    line-height: 25px;
  }
</style>
