<script>
  import Table from "./components/Table.svelte";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";

  let name = "Coin stats";
</script>

<main>
  <Header {name} />
  <Table />
  <Footer />
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
