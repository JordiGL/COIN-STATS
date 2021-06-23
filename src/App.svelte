<script>
  import Table from "./components/Table.svelte";
</script>

<main>
  <Table />
</main>

<style>
  main {
    text-align: center;
    margin: 0;
    padding: 0;
  }

  @media (min-width: 400px) {
    main {
      overflow: hidden;
      max-width: none;
    }
  }
</style>
