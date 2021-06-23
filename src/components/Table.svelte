<script>
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onDestroy } from "svelte";
  import { coinStore, url } from "../store/stores";

  let coins;
  let modificadorOrdre;
  let ordrePer;
  let ordrePerpercentatge = false;
  let posts = [];
  let response;

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

    coins = coins.filter((element) =>
      element.symbol.includes(valorACercar.toUpperCase())
    );
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
      <th
        class="desktop"
        on:click={(sort("priceChangePercent"), (ordrePerpercentatge = true))}
      >
        Percentatge
      </th>
      <th
        class="mobile"
        on:click={(sort("priceChangePercent"), (ordrePerpercentatge = true))}
      >
        %
      </th>
      <th on:click={sort("lastPrice")}>Valor</th>
    </tr>
  </thead>
  <tbody>
    {#each coins as row}
      <tr class={row.priceChangePercent >= 0 ? "majorHover" : "menorHover"}>
        <td class="desktop">{row.symbol}</td>
        <td class="mobile">{row.symbol}</td>
        <td class={row.priceChangePercent >= 0 ? "major" : "menor"}>
          {parseFloat(row.priceChangePercent).toFixed(2)}
        </td>
        <td class="desktop">{row.lastPrice}</td>
        <td class="mobile">{row.lastPrice.substring(0, 11)}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  /* mobile */
  @media only screen and (max-width: 600px) {
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

    .desktop {
      display: none;
    }

    .mobile {
      padding: 16px;

      display: block;
    }

    .menor {
      color: red;
    }

    .major {
      color: green;
    }
  }
  /* desktop */
  @media only screen and (min-width: 600px) {
    .cercador {
      width: 120px;
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

    .desktop {
      display: block;
    }

    .mobile {
      display: none;
    }

    .menor {
      color: red;
    }

    .major {
      color: green;
    }
  }

  .container {
    position: relative;
  }
  .title {
    float: left;
    height: 44px;
    font-size: xx-large;
    margin-left: 10px;
    padding: 2px;
  }

  .cercar {
    float: right;
    padding: 6px;
    margin-right: 10px;
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
</style>
