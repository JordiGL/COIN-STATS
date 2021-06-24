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
    <table class="popupTable">
      <tbody>
        <tr>
          <td><b>Coin:</b> {moneda.symbol}</td>
          <td><b>Last price:</b> {moneda.lastPrice}</td>
        </tr>
        <tr>
          <td><b>Open price:</b> {moneda.openPrice}</td>
          <td><b>Previous close price:</b> {moneda.prevClosePrice}</td>
        </tr>
        <tr>
          <td><b>Price change:</b> {moneda.priceChange}</td>
          <td><b>Price change percent:</b> {moneda.priceChangePercent}</td>
        </tr>
        <tr>
          <td><b>Weighted average price:</b> {moneda.weightedAvgPrice}</td>
          <td><b>Last quantity:</b> {moneda.lastQty}</td>
        </tr>
        <tr>
          <td><b>Bid price:</b> {moneda.bidPrice}</td>
          <td><b>Bid quantity:</b> {moneda.bidQty}</td>
        </tr>
        <tr>
          <td><b>Ask Price:</b> {moneda.askPrice}</td>
          <td><b>Ask quantity:</b> {moneda.askQty}</td>
        </tr>
        <tr>
          <td><b>High price:</b> {moneda.highPrice}</td>
          <td><b>Low price:</b> {moneda.lowPrice}</td>
        </tr>
        <tr>
          <td><b>Volume:</b> {moneda.volume}</td>
          <td><b>Quote volume:</b> {moneda.quoteVolume}</td>
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

  .popupTable {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  .popupTable tr {
    width: 50%;
  }

  .popupTable tr:nth-child(odd) {
    background-color: #f2f2f2;
  }

  .popupTable tr td {
    border: none;
    padding-right: 10px;
  }

  /* general */

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
