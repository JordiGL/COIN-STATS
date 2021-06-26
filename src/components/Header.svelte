<script>
  import "../../public/global.css";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { coinStore, url, data } from "../store/stores";
  import { onDestroy } from "svelte";

  let title = "Coin stats";
  let response;
  let posts;
  let coins;
  let timer;
  let inputField;
  let auxStore;

  //Subscripció a l'store.
  const unsubscribe = coinStore.subscribe((value) => {
    coins = value;
  });

  //Cancel·lar subscripció al tancar.
  onDestroy(unsubscribe);

  //Funció per a refrescar la taula mantenint l'ordre
  async function refrescar() {
    //Obtenir dades
    response = await fetch(url);
    posts = await response.json();
    if (inputField == "") {
      coinStore.set(posts);
    } else {
      //Comparació i actualització d'estore.
      coinStore.update((actualStore) => {
        actualStore.forEach((actualElement) => {
          posts.forEach((newValue) => {
            if (actualElement.symbol == newValue.symbol) {
              actualElement.askPrice = newValue.askPrice;
              actualElement.askQty = newValue.askQty;
              actualElement.bidQty = newValue.bidQty;
              actualElement.highPrice = newValue.highPrice;
              actualElement.lastPrice = newValue.lastPrice;
              actualElement.lastQty = newValue.lastQty;
              actualElement.lowPrice = newValue.lowPrice;
              actualElement.openPrice = newValue.openPrice;
              actualElement.prevClosePrice = newValue.prevClosePrice;
              actualElement.priceChange = newValue.priceChange;
              actualElement.priceChangePercent = newValue.priceChangePercent;
              actualElement.quoteVolume = newValue.quoteVolume;
              actualElement.volume = newValue.volume;
              actualElement.weightedAvgPrice = newValue.weightedAvgPrice;
              actualElement.bidPrice = newValue.bidPrice;
            }
          });
        });
        auxStore = actualStore;
        return actualStore;
      });
      coinStore.set(auxStore);
    }
  }

  //Funció per a cercar un valor
  export async function cercar(value) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      coinStore.update(() => {
        coins = data.filter((element) =>
          element.symbol.includes(value.toUpperCase())
        );
        return coins;
      });
    }, 750);
  }
</script>

<div class="container">
  <div class="title">{title}</div>
  <div class="cercar">
    <button on:click={refrescar}><Fa icon={faSync} /></button>
    <input
      class="cercador"
      placeholder="Search..."
      on:keyup={({ target: { value } }) => cercar(value)}
      bind:value={inputField}
    />
  </div>
</div>
