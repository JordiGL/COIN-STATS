<script>
  import "../../public/global.css";
  import { coinStore, url, data } from "../store/stores";
  import { sortOn } from "../gestor/utils";

  export let name;
  let response;
  let posts;
  let timer;
  let inputField;
  let auxStore;
  const nomColumnes = ["Nom", "24h%", "Last price"];
  const valorsColumnes = ["symbol", "priceChangePercent", "lastPrice"];
  let ascendent = true;
  let placeholder = "Search...";

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
              for (var i in actualElement) {
                actualElement[i] = newValue[i];
              }
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
  export async function cercar(searchTerm) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      coinStore.update(() => {
        return data.filter((element) =>
          element.symbol.includes(searchTerm.toUpperCase())
        );
      });
    }, 750);
  }

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

<div class="container">
  <div>
    <div class="title" on:click={refrescar}>{name}</div>
  </div>
  <div>
    <input
      class="cercador"
      {placeholder}
      on:keyup={({ target: { value } }) => cercar(value)}
      bind:value={inputField}
    />
  </div>
  <div class="capcalera">
    <div class="nom" on:click={() => coinsSort(valorsColumnes[0])}>
      <span>
        {nomColumnes[0]}
      </span>
    </div>
    <div class="percentatge" on:click={() => coinsSort(valorsColumnes[1])}>
      <span>
        {nomColumnes[1]}
      </span>
    </div>
    <div class="preu" on:click={() => coinsSort(valorsColumnes[2])}>
      <span>
        {nomColumnes[2]}
      </span>
    </div>
  </div>
</div>
