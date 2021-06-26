<script>
  import "../../public/global.css";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { coinStore, url } from "../store/stores";
  import { onMount } from "svelte";

  let title = "Coin stats";
  let response;
  let posts;
  let coins;
  let auxCoins;
  let timer;

  //En iniciar carrega les dades a l'estore.
  onMount(async () => {
    response = await fetch(url);
    posts = await response.json();
    coins = posts;
    coinStore.set(posts);
  });

  //Funció per a refrescar la taula
  async function refrescar() {
    response = await fetch(url);
    posts = await response.json();
    coinStore.set(posts);
  }

  //Funció per a cercar un valor
  export async function cercar(value) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      coinStore.update(() => {
        auxCoins = coins.filter((element) =>
          element.symbol.includes(value.toUpperCase())
        );
        return auxCoins;
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
    />
  </div>
</div>
