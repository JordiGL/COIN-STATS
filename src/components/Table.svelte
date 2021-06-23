<script>
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onDestroy } from "svelte";
  import { coinStore, url } from "../store/stores";
  import { twitterImage } from "./img";

  let coins;
  let modificadorOrdre;
  let ordrePer;
  let ordrePerpercentatge = false;
  let posts = [];
  let response;
  let percentatge = "Percentatge";
  let desktop = 600;
  let limitPercentatge = 0;
  let lastPriceSubstring = 11;
  let timer;

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
      placeholder="Cercar..."
      on:keyup={({ target: { value } }) => cercar(value)}
    />
  </div>
</div>

<!-- Taula -->
<table>
  <thead>
    <tr>
      <th on:click={sort("symbol")}>Nom</th>
      <th on:click={(sort("priceChangePercent"), (ordrePerpercentatge = true))}>
        {#if window.screen.width < desktop}
          {(percentatge = "24h %")}
        {:else}
          {percentatge}
        {/if}
      </th>
      <th on:click={sort("lastPrice")}>Valor</th>
    </tr>
  </thead>
  <tbody>
    {#each coins as row}
      <tr
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
        <td>
          {#if window.screen.width < desktop}
            {row.lastPrice.substring(0, lastPriceSubstring)}
          {:else}
            {row.lastPrice}
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
<footer>
  <img class="avatar" src={twitterImage} alt="" /> Jordi Gómez Lozano - 2021
</footer>

<style>
  /* mobile */
  @media only screen and (max-width: 600px) {
    .title {
      float: left;
      height: 44px;
      font-size: xx-large;
      margin-left: 2px;
      padding: 14px;
    }

    .cercar {
      float: right;
      padding: 15px;
      margin-right: 2px;
    }

    .cercador {
      width: 100px;
    }

    table th {
      text-align: left;
      background-color: #424242;
      color: white;
      padding: 15px;
      resize: none;
      font-size: 14px;
    }

    table td {
      font-size: 14px;
      padding: 15px;
      text-align: left;
    }
  }
  /* desktop */
  @media only screen and (min-width: 600px) {
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

    table th {
      text-align: center;
      background-color: #424242;
      color: white;
      padding: 15px;
      resize: none;
    }

    table td {
      padding: 15px;
      text-align: center;
    }
  }

  /* general */
  .container {
    position: relative;
  }

  table {
    font-family: Arial, Helvetica, sans-serif;
    width: 100%;
  }

  table tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .menorHover:hover {
    background-color: rgb(255, 244, 244);
  }

  .majorHover:hover {
    background-color: rgb(244, 255, 244);
  }

  .menor {
    color: red;
  }

  .major {
    color: green;
  }

  footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    background-color: #424242;
    color: white;
    text-align: center;
    line-height: 40px;
  }
</style>
