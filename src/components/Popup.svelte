<script>
  export let moneda = [];
  import Popup from "svelte-atoms/Popup.svelte";
  export let isOpen = false;
  const close = () => (isOpen = false);
</script>

<Popup {isOpen} on:close={close} header={moneda.symbol}>{moneda.volume}</Popup>
