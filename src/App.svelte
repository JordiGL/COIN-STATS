<script>
  import Table from "./components/Table.svelte";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
</script>

<main>
  <Header />
  <Table />
  <Footer />
</main>

<style>
  main {
    text-align: center;
    margin: 0;
    padding: 0;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
