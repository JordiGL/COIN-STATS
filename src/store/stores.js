import { writable } from 'svelte/store';

export const url = "https://api.binance.com/api/v1/ticker/24hr";
export let data = [];
let response;

export const coinStore = writable(data, async set => {
    response = await fetch(url);
    data = await response.json();
    set(data)
});
