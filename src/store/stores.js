import { writable } from 'svelte/store';

export const url = "https://api.binance.com/api/v1/ticker/24hr";

// export const coinStore = writable([], async set => {
//   const res = await fetch(url);
//   const coins = await res.json();
//   set(coins);
//   return () => { };
// });
export const coinStore = writable([]);