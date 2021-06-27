<script>
  import "../../public/global.css";
  import Fa from "svelte-fa";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { coinStore, url, data } from "../store/stores";

  export let name;
  let response;
  let posts;
  let timer;
  let inputField;
  let auxStore;

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
</script>

<div class="container">
  <div class="title">{name}</div>
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
